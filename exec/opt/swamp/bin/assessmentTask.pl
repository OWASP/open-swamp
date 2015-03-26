#!/usr/bin/env perl
#** @file assessmentTask.pl
# @brief The  Assessment Task is the executable specified in the HTCondor job
# This code runs on a hypervisor.
# @verbatim
# When started via condor, the command line will contain the inputs
# This script needs access to libvirt, so it should be sudo'd.
# Create the input folder for the VM image.
# Copy the toolpath as specified in the BOG to input folder.
# Copy the packagepath as specified in the BOG to the input folder.
# Create the 'run.sh' from the BOG specifications.
# Communicate with the AgentMonitor.
# Start the VM.
# Wait for the VM to finish by running an event loop
# @endverbatim
#
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

use 5.014;
use utf8;
use warnings;
no warnings qw(experimental);
use strict;
use FindBin qw($Bin);
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );
use sigtrap 'handler', \&taskShutdown, 'normal-signals';

use Archive::Tar qw(COMPRESS_GZIP);
use Carp 'croak';
use ConfigReader::Simple;
use Cwd qw(getcwd abs_path);
use English '-no_match_vars';
use File::Basename qw(basename dirname);
use File::Copy qw(move cp);
use File::Path qw(make_path remove_tree);
use File::Spec qw(catfile);
use Getopt::Long qw/GetOptions/;
use Log::Log4perl::Level;
use Log::Log4perl;
use POSIX qw(:sys_wait_h WNOHANG);    # for nonblocking read
use POSIX qw(setsid waitpid);
use Pod::Usage qw/pod2usage/;
use Storable qw(lock_retrieve);
use XML::Simple qw(:strict);
use XML::LibXSLT;
use XML::LibXML;

use SWAMP::SWAMPUtils qw(uname loadProperties saveProperties);
use SWAMP::Client::AgentClient
  qw(configureClient removeVmID addVmID createVmID updateAssessmentStatus);
use SWAMP::Client::ResultCollectorClient qw(configureClient);
use SWAMP::Client::ExecuteRecordCollectorClient
  qw(configureClient getSingleExecutionRecord updateRunStatus updateExecutionResults);
use SWAMP::AssessmentTools qw(builderUser builderPassword copyInputs
  createRundotsh invokeResultCollector saveRunresults
  createAssessConfigs
  createMIRAssess
  isJavaTool
  isJavaBytecodePackage
  packageType
  parseStatusOut
  parseRun
  warnMessage
  debugMessage
  infoMessage
  errorMessage
);

##use SWAMP::VMPrimitives qw(vmRegister);

#use AgentClient qw();
use SWAMP::SWAMPUtils qw(
  makeoption
  diewithconfess
  createDomainPIDFile
  getBuildNumber
  getDomainStateFilename
  getLoggingConfigString
  getSWAMPDir
  getSwampConfig
  loadProperties
  removeDomainPIDFile
  systemcall
  trim
  condor_chirp
);

use SWAMP::ToolLicense qw(
	openLicense
	closeLicense
);

our $VERSION = '1.00';
my $basedir = getSWAMPDir();

my $help       = 0;        #** @var $help If true, display brief POD
my $man        = 0;        #** @var $man If true, display man page POD
my $debug      = 0;        #** @var $debug If true, increase log level to DEBUG
my $startupdir = getcwd;

#** @var $agentHost The hostname on which agentMonitor is listening
my $agentHost;

#** @var $agentPort The agentMonitor port
my $agentPort;

#** @var $dispHost The hostname on which dispatchMonitor is listening
my $dispHost;

#** @var $agentPort The port on which the dispatchMonitor is listening
my $dispPort;

#** @var $outputfile The default output filename.
# HTCondor expects this file to exist
my $outputfile;

#** @var $bogfile The name of our Bill Of Goods file
my $bogfile;

#** @var $uri of our libvirt, currently using 'undef'
my $uri;

#** @var $vmname Name of the Virtual Machine this script will create.
my $vmname = "swamp${PID}";

#** @var $vmid Opaque id of the Virtual Machine this script will create.
my $vmid;

#** @var $ok Flag indicating this script should continue
my $ok = 1;

#** @var %bog The map that will contain our Bill Of Goods for this assessment run.
my %bog;

my $builderUser = builderUser();
my $builderPassword = builderPassword();
my $vmdomain=q{vm.cosalab.org};

#** @var $isBaTLab True if this assessment run is a BaTLab job, false otherwise. BaTLab jobs do NOT have/need BOGs
my $isBaTLab = 0;

#** @var $appname Textual name for this process's logger
my $appname = "assessmenttask_$PID";

#** @var $log Global Log::Log4perl object
my $log;

#** @var $outdiskimage If specified, this is to contain all of /mnt/out as a single tarball
my $outdiskimage; 

#** @var $userinputfolder If specified, this folder's contents will become /mnt/in
# overriding the default 'input' creation.
my $userinputfolder;

#** @var $platform on which the VM should run. This must be one of the outputs listed by 'start_vm --list'
# If not specified, this value will be taken from the BOG.
my $platform;

# ** @var $exitfile Causes the launcher to terminate with the (ASCII-encoded) value in <filename>, or
# /mnt/out/run.result if unspecified.  Useful for working with job management systems.
my $exitfile = q{run.result};

# ** @var $exitvalue Exit value found in exitfile. Undef if exitfile undefined
# or non-existent
my $exitvalue; 

# ** @var $vmfolder The value to pass to the start_vm,vm_cleanup,vm_output
# functions as the location of VM files. This will become the location of
# delta, input, output files while the VM is running and will be cleaned up
# when the VM is disposed of.
my $vmfolder;
# ** @var $imagefolder The value to pass to the start_vm,vm_cleanup,vm_output
# functions as the location of VM master image files.
my $imagefolder;

# ** @var $nCPU The number of CPU the VM should have.
my $nCPU;

# ** @var $memMB The number of megabytes the VM should use.
my $memMB;

#** @var $numberStarts The number of times we've had to start our VM.
my $nRestarts = 0;
use constant {
    'OUTPUTFOLDER' => q{out},
    'MAX_RESTARTS'  => 3,      # number of times to allow a VM to restart before giving up.
    'MAX_WAITSTUCK' => 600,    # number of seconds to wait for a VM to start running the assessment.
    'RETRY_RATE' => 60, # Number of seconds between calls to guestfish
};

my $PRESERVE_OUTPUT_NEVER = 0;
my $PRESERVE_OUTPUT_FAILURE = 1;
my $PRESERVE_OUTPUT_SUCCESS = 2;
my $PRESERVE_OUTPUT_ALWAYS = 3;
my $preserveOutput = $PRESERVE_OUTPUT_ALWAYS;

#** @var %children PIDs of child processes
my %children;
local $SIG{'CHLD'} = sub {

    # don't change $! and $? outside handler
    local $OS_ERROR    = $OS_ERROR;
    local $CHILD_ERROR = $CHILD_ERROR;
    my $pid = 1;
    while ( $pid > 0 ) {
        $pid = waitpid( -1, WNOHANG );
    }
    return if $pid == -1;
    if ( !defined( $children{$pid} ) ) {
        return;
    }
    delete $children{$pid};
};

GetOptions(
    'bog=s'           => \$bogfile,
    'vmfolder=s'      => \$vmfolder,
    'vmimagefolder=s' => \$imagefolder,
    'cpu=i'           => \$nCPU,
    'mem=i'           => \$memMB,
    'debug'           => \$debug,
    'vmname=s'        => \$vmname,
    'resultfile=s'    => \$exitfile,
    'ahost=s'         => \$agentHost,
    'aport=s'         => \$agentPort,
    'dhost=s'         => \$dispHost,
    'dport=s'         => \$dispPort,
    'out=s'           => \$outputfile,
    'outputfile=s'    => \$outdiskimage,
    'inputfolder=s'   => \$userinputfolder,
    'platform=s'      => \$platform,
    'libvirturi'      => \$uri,
    'help|?'          => \$help,
    'man'             => \$man,
    'preserve'        => \$preserveOutput,
) or pod2usage(2);

if ($help) { pod2usage(1); }
if ($man)                    { pod2usage( '-verbose' => 2 ); }
if ( !defined($bogfile) ) {
    if ( !defined($platform) ) {
        pod2usage(
'either a bill of goods,--bog file, or a platform, --platform platform,  must be specified'
        );
    }
}
# N.B. Sea change : assessmentTask can run w/out a BOG now, this has repercussions.
# No bogfile implies BaTLab job
if ( !defined($bogfile) ) {
    $isBaTLab = 1;
    # The only field needed in the BOG for non-SWAMP aruns.
    $bog{'execrunid'} = q{batlab_}.$vmname;
}
if ( defined($userinputfolder) ) {
    $userinputfolder = abs_path($userinputfolder);
}

# Convert parameters into option settings or blanks
$imagefolder=makeoption($imagefolder, 'vmimagefolder');
$vmfolder=makeoption($vmfolder, 'vmfolder');
$nCPU = makeoption($nCPU, 'cpu');
$memMB = makeoption($memMB, 'mem');

$appname = "assessmenttask_$vmname";
$appname =~ s/swamp//sxm;

my $inputfolder     = q{input};

Log::Log4perl->init( getLoggingConfigString() );
if ( !$debug ) {
    Log::Log4perl->get_logger(q{})->remove_appender('Screen');
}

$log = Log::Log4perl->get_logger(q{});
$log->level( $debug ? $TRACE : $INFO );

# Catch anyone who calls die.
local $SIG{'__DIE__'} = \&diewithconfess;
configureClients( $agentHost, $agentPort, $dispHost, $dispPort );

createDomainPIDFile($PID, $vmname);

my $ver = "$VERSION." . getBuildNumber();
$log->info( "#### $appname v$ver running on " . `hostname -f` );

# The launcher no longer extracts the tarball for us, do it now.

if ( !setupWorkingSpace($vmname) ) {
    $ok = 0;
    errorMessage( 'undef id', "Unable to set up working space." );
}
if ( !$isBaTLab && loadProperties( $bogfile, \%bog ) == 0 ) {
    $ok = 0;
    errorMessage( 'undef id', "Unable to load BOG $bogfile" );
}

condor_chirp($bog{'intent'}, "NAME", "vmname", $vmname);
condor_chirp($bog{'intent'}, "ID", "execution_record_uuid", $bog{'execrunid'});
condor_chirp($bog{'intent'}, "TIME", "assessmentTask_start", time());

if (!defined($platform)) {
    $platform = $bog{'platform'};
}

if ($ok && !$isBaTLab) {
    $log->info("Assessing $bog{'packagename'} using $bog{'toolname'} on $platform");
}

if (defined($userinputfolder)) {
   # Use user provided, existing folder.
   $inputfolder = $userinputfolder; 
}
else {
    $ok = createInputDisk( \%bog, $inputfolder) ;
    if ($ok) {
        # If assessing byte code and this is not a java package, don't even start.
        if ( !isJavaTool(\%bog) && isJavaBytecodePackage(\%bog)) {
            # If we're going to fail to run, we still need a vmID
            $vmid = createVmID();
            addVmID( $vmid, $bog{'execrunid'}, $vmname );
            $ok = 0;
            # Run is 'done'
            removeVmID( \$vmid );
            updateExecResultsAndEventlog(
                $bog{'execrunid'},
                {
                    'status'                       => 'Unable to assess.',
                    'run_date'                     => scalar localtime,
                    'completion_date'              => scalar localtime,
                    'cpu_utilization'              => 'd__0',
                    'lines_of_code'                => 'i__0',
                    'execute_node_architecture_id' => `uname -a`
                }
            );
        }
    }
}


if ($ok) {
    # $ok = launchVM($bog{'execrunid'}, $inputfolder, $platform);
    $ok = launchVM(\%bog, $inputfolder, $platform);
}


my @results;
if ( !$isBaTLab ) {
    push @results, $bogfile;
    push @results, logfilename();
    push @results, 'input/run.sh';
    push @results, 'input/_run.sh';
    push @results, 'input/package.conf';
    push @results, 'input/run.conf';
    push @results, 'input/os-dependencies.conf';

    # Add the input assessed to the output results.
    push @results, "$bog{'packagepath'}";
}
if ($ok) {
    runAssessment( \%bog );
}

infoMessage( $bog{'execrunid'}, "#### $appname archiving results" );
if ( $isBaTLab && defined($outdiskimage) ) {
    my $pathtotarball;
    if ( $outdiskimage ne abs_path($outdiskimage) ) {
        # If this is a relative path, make it absolute to where this process
        # started
        $pathtotarball = File::Spec->catfile( $startupdir, $outdiskimage );
    }
    else {
        $pathtotarball = $outdiskimage;
    }
    my $cmd = "tar --exclude=lost+found -czf $pathtotarball " . main->OUTPUTFOLDER;
    system($cmd);
}
if (defined($outputfile)) {
    Archive::Tar->create_archive( File::Spec->catfile( $startupdir, $outputfile ),
        COMPRESS_GZIP, @results );
}
infoMessage( $bog{'execrunid'}, "#### $appname exiting ok=$ok" );

removeStateFile($vmname);
cleanupWorkingSpace();
removeDomainPIDFile($PID, $vmname);

if (!defined($exitvalue)) {
    exit $ok ? 0 : 1;
}
else {
    exit (0+$exitvalue);
}

#** @function launchVM($bogref, $folder, $vmplatform) 
# @brief Start a virtual machine 
# 
# @param bogref Reference to the Bill Of Goods describing this job
# @param folder The folder to be used as the input disk of the VM
# @param vmplatform The desired platform used to create the VM
#
# @return 0 on failure, 1 on success
#*
sub launchVM {
    my $bogref = shift;
    my $folder = shift;
    my $vmplatform = shift;
    my $execrunid = $bogref->{'execrunid'};
    my $ret = 0;

    # Let's make a VM
    $vmid = createVmID();
    addVmID( $vmid, $execrunid, $vmname );

    updateRunStatus( $execrunid, 'Starting virtual machine' );
    updateAssessmentStatus( $execrunid, 'Starting virtual machine' );

	condor_chirp($bogref->{'intent'}, "TIME", "start_vm", time());
    my ( $output, $status ) =
      systemcall(
"PERL5LIB=$basedir/perl5 $basedir/bin/start_vm --outsize 3072 --name $vmname $folder $vmplatform $imagefolder $vmfolder $nCPU $memMB"
      );

    # TODO : we could free up space held by ./input now if need be. 
    # N.B. If input is not user specified.

    if ($status) {
        errorMessage( $execrunid, "start_vm returned: $output" );
        removeVmID( \$vmid );
        errorMessage( $execrunid, "Unable to startVM $status" );
        updateExecResultsAndEventlog(
            $execrunid,
            {
                'status'                       => 'Unable to start VM',
                'run_date'                     => scalar localtime,
                'completion_date'              => scalar localtime,
                'cpu_utilization'              => 'd__0',
                'lines_of_code'                => 'i__0',
                'execute_node_architecture_id' => `uname -a`
            }
        );
    }
    else {
		condor_chirp($bogref->{'intent'}, "TIME", "setDeadman", time());
        setDeadman(0);
        $nRestarts = 0;    # Clean slate.
        $ret = 1;
    }
	condor_chirp($bog{'intent'}, "TIME", "return", time());
    return $ret;
}
#** @function createInputDisk( $outfolder, $bogref, \$retryref )
# @brief Create files needed in the input disk for SWAMP assessment
#
# @param bogref Reference to the Bill Of Goods being used
# @param folder The name of the input folder in which files
# should be created.
# @return 0 on failure, 1 on success
#*
sub createInputDisk {
    my $bogref = shift;
    my $folder = shift;
    my $ret    = 0;
    if ( copyInputs( $bogref, $folder ) ) {
        if ( createRundotsh( $bogref, $folder ) ) {
            if ( createAssessConfigs( $bogref, $folder, $builderUser, $builderPassword ) ) {
                $ret = 1;
            }
        }
    }
    return $ret;
}

#** @function processOutput( $outfolder, $bogref, \$retryref )
# @brief Given a finished arun, process the output from the VM.
#
# @param outfolder The folder in which to find the output files.
# @param bogref Reference to the Bill Of Goods (BOG) being used for this arun.
# @param retryref Reference to a scalar that will be set to 1 if the arun should be retried.
# @param willRetry if false, the assessment will not be retried, so save if possible.
#*
sub processOutput {
    my $outfolder  = shift;
    my $bogref     = shift;
    my $retryref   = shift;
    my $willRetry  = shift;
    my $resultfile = 'results.xml';
    my $logfile    = 'swamp_run.out';

    given ( $bogref->{'toolname'} ) {
        when (/PMD/isxm) {
            $resultfile = 'PMD.xml';
        }
        when (/Findbugs/isxm) {
            $resultfile = 'Findbugs.xml';
        }
        when (/Archie/isxm) {
            $resultfile = 'archie.xml';
        }
        when (/cppcheck/sxm) {
            $resultfile = 'cppcheck.xml';
        }
        when (/clang/isxm) {
            $resultfile = 'clang.xml';
        }
        when (/gcc/isxm) {
            $resultfile = 'gcc-warn.xml';
        }
        when (/error-prone/isxm) {
            $resultfile = 'error-prone.xml';
        }
        when (/checkstyle/isxm) {
            $resultfile = 'checkstyle.xml';
        }
        when (/Pylint/isxm) {
            $resultfile = 'pylint.xml';
        }
    }
    my $finalStatus = q{Finished};
	my ($processResult, $weaknesses) = processAssessToolResults( $outfolder, $resultfile, $bogref->{'toolname'}, $retryref );
	# Assessment failed
    if (! $processResult) {
        # If there isn't going to be a retry or retry will be ignored, go ahead save.
        if ( ${$retryref} == 0 || $willRetry == 0 ) {
            $finalStatus = q{Finished with errors};
			if ($preserveOutput == $PRESERVE_OUTPUT_ALWAYS || $preserveOutput == $PRESERVE_OUTPUT_FAILURE) {
            	$log->info("preserving results on failure ${$retryref} $willRetry");
            	cp('input/run.sh',  $outfolder);
            	cp('input/_run.sh',  $outfolder);
            	cp('input/package.conf',  $outfolder);
            	cp('input/tool.conf',  $outfolder);
            	cp('input/services.conf',  $outfolder);
            	cp('input/os-dependencies.conf', $outfolder);
            	cp('input/run.conf', $outfolder);
            	# Save version information in this run.
            	cp(abs_path("$basedir/etc/versions.txt"), $outfolder);
            	saveProperties("$outfolder/swamp.bog", $bogref);
            	saveRunresults( $outfolder, $bogref, 'results.tar.gz' );
			}
            $resultfile = "${outfolder}/results.tar.gz";
        }
    }
	# Assessment succeeded
	else {
    	if ( ${$retryref} == 0 || $willRetry == 0 ) {
			if ($preserveOutput == $PRESERVE_OUTPUT_ALWAYS || $preserveOutput == $PRESERVE_OUTPUT_SUCCESS) {
        		$log->info("preserving results on success ${$retryref} $willRetry");
				cp('input/run.sh',  $outfolder);
				cp('input/_run.sh',  $outfolder);
				cp('input/package.conf',  $outfolder);
				cp('input/tool.conf',  $outfolder);
				cp('input/services.conf',  $outfolder);
				cp('input/os-dependencies.conf', $outfolder);
				cp('input/run.conf', $outfolder);
				# Save version information in this run.
				cp(abs_path("$basedir/etc/versions.txt"), $outfolder);
        		saveProperties("$outfolder/swamp.bog", $bogref);
        		saveRunresults( $outfolder, $bogref, 'results.tar.gz' );
			}
		}
	}
    # If there isn't going to be a retry or retry will be ignored, save.
    if ( ${$retryref} == 0 || $willRetry == 0 ) {
        my $execResults = getSingleExecutionRecord( $bogref->{'execrunid'} );
		if (defined($execResults)) {
			$execResults->{'weaknesses'} = 'i__' . $weaknesses;
		}
        $log->info("calling invokeResultCollector ${$retryref} $willRetry");
        if ( defined($execResults) ) {
            $execResults->{'status'} = q{Saving results};
            updateExecResultsAndEventlog( $bogref->{'execrunid'}, $execResults );
        }
        invokeResultCollector(
            'bogref'      => $bogref,
            'tarball'     => "${outfolder}/results.tar.gz",
            'soughtfile'  => $resultfile,
            'logfile'     => "${outfolder}/$logfile",
            'extractFile' => isMIRToolchain($bogref)
        );
        # Set final status after results have been saved.
        if ( defined($execResults) ) {
            $execResults->{'status'} = $finalStatus;
            updateExecResultsAndEventlog( $bogref->{'execrunid'}, $execResults );
        }
    }
    return;
}

#** @function processAssessToolResults( $folder, $result, $tool)
# @brief Attempt to generate an HTML result file
# from the output of the UW toolchain
#
# @param folder Location of result.conf
# @param result Location of HTML output
# @param tool Name of the tool used. This should be 'toolname' in the bog
# @return 1 on success, 0 on failure, weaknesses count.
#*
sub processAssessToolResults {
    my $folder   = shift;    # Where results.conf is
    my $result   = shift;    # Where to write HTML .
    my $tool     = shift;    # The name of the tool
    my $retryref = shift;    # Should we retry?

	my $weaknesses;
    my ( $output, $status ) = systemcall("cat $folder/status.out");
    if ( !$status ) {
        (my $runOK, my $why, $weaknesses) = parseStatusOut( $output, $retryref );
        if ( !$runOK ) {
            $log->error("status.out indicates the assessment failed: $why");
            return (0, $weaknesses);
        }
    }
    else {
        $log->warn("Cannot parse status.out: $status : $output");
    }

    if ( -r "$folder/parsed_results.conf" ) {
        $log->info("Parsed loading properties");

        # New world: SWAMP Common output format handled here.
        my $config = loadProperties("$folder/parsed_results.conf");
        $log->info("Parsed config: $config");
        my $tarball = File::Spec->catfile( $folder, $config->get('parsed-results-archive') );
        $log->info("Parsed tarball: $tarball");
        ( $output, $status ) = systemcall("tar -C $folder -xf $tarball");
        $log->info( "Parsed parsed-results-dir: " . $config->get('parsed-results-dir') );
        $log->info( "Parsed parsed-results-file: " . $config->get('parsed-results-file') );
        my $xmlfile = File::Spec->catfile(
            $folder,
            $config->get('parsed-results-dir'),
            $config->get('parsed-results-file')
        );
        $log->info("Parsed xml: $xmlfile");
        cp( $xmlfile, File::Spec->catfile( $folder, $result ) );
        return (1, $weaknesses);
    }
    if ( !-r "$folder/results.conf" ) {
        $log->error('The results.conf file could not be found.');
        return (0, $weaknesses);
    }

    # $result now points to the folder/result.xml file
    $result = File::Spec->catfile( $folder, $result );

    my $confobj = loadProperties("$folder/results.conf");

    my $base = File::Spec->catfile(
        $folder,
        $confobj->get('results-dir'),
        $confobj->get('assessment-summary-file')
    );
    my $tarball = File::Spec->catfile( $folder, $confobj->get('results-archive') );

    # Open the results tarball
    ( $output, $status ) = systemcall("tar -C $folder -xf $tarball");
    if ($status) {
        $log->error("Unable to extract $tarball $status $output");
        return (0, $weaknesses);
    }
    my $xs = XML::Simple->new( 'ForceArray' => 1 );
    $log->info("XML filename is [$base]");
    if ( !-r $base ) {

        # There's a bug in cpp toolchain
        $base =~ s/_/-/sxmg;
        if ( !-r $base ) {
            $log->error("The XML file $base could not be found.");
            return (0, $weaknesses);
        }
    }
    my $artifactkey = 'assessment-artifacts';
    my $ref         = $xs->XMLin( $base, 'KeyAttr' => [ 'name', 'key', 'id' ] );
    my $alist       = $ref->{$artifactkey};
    my $aref        = $alist->[0]->{'assessment'};
    my $dirname     = dirname($base);
    my $xml;

###    my $allXML = File::Spec->catfile( $folder, 'allreports.xml' );
    if ( !open( $xml, '>', $result ) ) {
        $log->error("Unable to create allreports file $OS_ERROR");
        return (0, $weaknesses);
    }
    $log->info("Opened allreports.xml");
    my $patt;
###    my $xsltfile;

    if ( $tool eq 'PMD' ) {
        $patt = 'pmd';
###        $xsltfile = File::Spec->catfile( getSWAMPDir(), 'etc', 'pmd.xslt' );
    }
    elsif ( $tool eq 'Findbugs' ) {
        $patt = 'BugCollection';
###        $xsltfile = File::Spec->catfile( getSWAMPDir(), 'etc', 'findbugs.xslt' );
    }
    elsif ( $tool =~ /cppcheck/sxmi ) {
        $patt = 'results';
###        $xsltfile = File::Spec->catfile( getSWAMPDir(), 'etc', 'cppcheck.xslt' );

    }
    elsif ( $tool =~ /clang/isxm ) {
        $patt = 'plist';
###        $xsltfile = File::Spec->catfile( getSWAMPDir(), 'etc', 'clang-sa.xslt' );
    }

    my $idx = 0;
    if ( $tool =~ /clang/ixsm ) {

        foreach my $reports ( @{$aref} ) {

            # clang emits a single folder full of stuff
            my $reportdir = File::Spec->catfile( $dirname, $reports->{'report'}[0] );
            my @files     = glob "$reportdir/*.plist";
            my $showedDTD = 0;
            foreach my $item (@files) {

                #processOneXML( $xml, $item, $idx, $#files, $patt, \$showedDTD );
                processOneXML(
                    'xmlhandle'  => $xml,
                    'filename'   => $item,
                    'idx'        => $idx,
                    'pattern'    => $patt,
                    'end'        => $#files,
                    'showDTDRef' => \$showedDTD
                );
                $idx++;
            }
        }
    }
    else {
        my $showedDTD = 0;
        if ( $tool =~ /gcc/isxm ) {
            print $xml "<HTML><HEAD><TITLE>GCC assessment results</TITLE></HEAD><BODY><PRE>\n";
        }
        foreach my $item ( @{$aref} ) {
            my $report = File::Spec->catfile( $dirname, $item->{'report'}[0] );

            #processOneXML( $xml, $report, $idx, $#{$aref}, $patt, \$showedDTD );
            if ( $tool =~ /gcc/isxm ) {
                processOneTxt(
                    'xmlhandle' => $xml,
                    'filename'  => $report
                );
            }
            else {
                processOneXML(
                    'xmlhandle'  => $xml,
                    'filename'   => $report,
                    'idx'        => $idx,
                    'end'        => $#{$aref},
                    'pattern'    => $patt,
                    'showDTDRef' => \$showedDTD
                );
            }
            $idx++;
        }
        if ( $tool =~ /gcc/isxm ) {
            print $xml "</PRE></BODY></HTML>\n";
        }
    }
    if ( !close($xml) ) {
        $log->warn("Unable to close allreports filehandle $OS_ERROR");
    }
    return (1, $weaknesses);
## This code now needs to move to the DS instance to be called on demand
###    my $xslt = XML::LibXSLT->new();
###
###    my $source;
###
###    # Wrap this in an eval to catch any exceptions parsing output from the assessment.
###    my $success = eval { $source = XML::LibXML->load_xml( 'location' => $allXML ); };
###    if ( defined($success) ) {
###        my $style_doc  = XML::LibXML->load_xml( 'location' => "$xsltfile", 'no_cdata' => 1 );
###        my $stylesheet = $xslt->parse_stylesheet($style_doc);
###        my $results    = $stylesheet->transform($source);
###        $stylesheet->output_file( $results, "$folder/$htmlfile" );
###    }
###    else {
###        $log->error("Loading allreports.xml threw an exception.");
###        return (0, $weaknesses);
###    }
###    return (1, $weaknesses);
}

sub processOneTxt {
    my %options = (
        @_,    # actual args overwrite defaults.
    );
    my $xmlhandle = $options{'xmlhandle'};
    my $filename  = $options{'filename'};
    $log->info("processing report [$filename]");

    if ( open( my $fh, '<', $filename ) ) {
        while (<$fh>) {
            print $xmlhandle $_;
        }
        if ( !close($fh) ) {
            $log->warn("Unable to close $filename $OS_ERROR");
        }
    }
    return;
}

sub processOneXML {
    my %options = (
        @_,    # actual args overwrite defaults.
    );
    my $xmlhandle    = $options{'xmlhandle'};
    my $filename     = $options{'filename'};
    my $idx          = $options{'idx'};
    my $end          = $options{'end'};
    my $patt         = $options{'pattern'};
    my $showedDTDRef = $options{'showDTDRef'};
    $log->info("processing report [$filename]");

    if ( open( my $fh, '<', $filename ) ) {
        while (<$fh>) {
            if ( $end > 0 ) {
                if ( $idx == 0 ) {    # first report
                    next if ( $idx != $end && /<\/$patt/sxm );
                }
                elsif ( $idx == $end ) {    # Last report
                    next if (/<\?xml/sxm);
                    next if (/<$patt/sxm);
                }
                else                        # a report somewhere in the middle
                {
                    next if (/<\?xml/sxm);
                    next if (/<$patt/sxm);
                    next if (/<\/$patt/sxm);
                }
            }
            if (/<!DOCTYPE/sxm) {
                if ( ${$showedDTDRef} == 0 ) {
                    ${$showedDTDRef} = 1;
                }
                else {
                    next;
                }
            }
            print $xmlhandle $_;
        }
        if ( !close($fh) ) {
            $log->warn("Unable to close $filename $OS_ERROR");
        }
    }
    return;
}

sub runAssessment {
    my $bogref    = shift;
    my $outfolder = main->OUTPUTFOLDER; 
    my $output;
    my $status;
    my $stuck   = qq{};
    my $doRetry = 0;
    my $done    = 0;
    # Maintain a counter for number of retries. This differs from the counter for stuck VMs by design.
    my $nTries  = 0;
    my $execrunid = $bogref->{'execrunid'};

    updateRunStatus( $execrunid, q{Performing assessment} );
    updateAssessmentStatus( $execrunid, q{Peforming assessment} );

    # CSA-1588 Here we have successfully created the VM . If
    # $bogref->{toolname} is a parasoft tool, then the floodlight controller
    # should have a flow added to it to allow access from $vmname to the
    # parasoft license server
	my $license_result = SWAMP::ToolLicense::openLicense($bogref, $vmname);

    while ( !$done ) {
        if ( doWaitLoop($execrunid) ) {

            # CSA-1588 Here we have a VM shutdown. if it was using a parasoft
            # tool, the floodlight controller should have flows removed
            # associated with this VM
            #
			SWAMP::ToolLicense::closeLicense($bogref, $license_result);
            infoMessage( $execrunid, 'VM has shutdown' );
            make_path(main->OUTPUTFOLDER);
            infoMessage( $execrunid, "#### $appname extracting output VM $outfolder ".abs_path($outfolder) );
            ( $output, $status ) =
              systemcall("PERL5LIB=$basedir/perl5 $basedir/bin/vm_output $vmname $outfolder $imagefolder $vmfolder");
            if ($status) {
                errorMessage( $execrunid,
                    "Unable to extract output from $vmname: $output ".abs_path($outfolder) );
                $done = 1;
            }
            else {
                if ($isBaTLab && defined($userinputfolder)) { # Just bail out, this is a BatLab run.
                    if (defined($exitfile)) {
                        my $resfile=File::Spec->catfile($outfolder, $exitfile);
                        if (-r $resfile) {
                            $exitvalue = `cat $resfile`;
                            chomp $exitvalue;
                        }
                    }

                    $done = 1;
                    last; # Make sure BaTLab jobs exit before invoking processOutput
                }
                # BaTLab jobs do not get to here, see: last above.
                $doRetry = 0;
                processOutput( $outfolder, $bogref, \$doRetry, ( $nTries < main->MAX_RESTARTS ) );
                if ( $doRetry == 0 ) {
                    $done = 1;
                }
                else {
                    if ( $nTries < main->MAX_RESTARTS ) {
                        removeStateFile($vmname);
                        remove_tree(main->OUTPUTFOLDER);
                        restartVM(0);
                        $nTries++;
                        infoMessage($execrunid, "Retrying assessment : $nTries");
                    }
                    else {
                        warnMessage($execrunid, 'NOT retrying assessment : too many retries');
                        $done = 1;
                    }
                }
            }
        }
        else {
            $stuck = '--force';    # Stuck VMs need coercion.
            $done  = 1;            # This VM won't even start
        }
    }

    removeVmID( \$vmid );
    infoMessage( $execrunid, "#### $appname cleaning up VM" );

    # Tear down the VM in the background
    ( $output, $status ) =
      systemcall("PERL5LIB=$basedir/perl5 $basedir/bin/vm_cleanup $stuck  $vmname $imagefolder $vmfolder 2>&1");
    if ($status) {
        warnMessage( $execrunid, "Unable to cleanup from $vmname: $output" );
    }

    if (!$isBaTLab) {
        push @results, "${outfolder}/run.out";
        push @results, "${outfolder}/results.conf";
        push @results, "${outfolder}/results.tar.gz";
    }
    return;
}

sub updateExecResultsAndEventlog {
    my $execrunid = shift;
    my $ref       = shift;
    state $lastStatus=q{};
    updateExecutionResults( $execrunid, $ref );
    if ($lastStatus ne $ref->{'status'}) {
        updateAssessmentStatus( $execrunid, $ref->{'status'} );
    }
    $lastStatus = $ref->{'status'};
    return;
}

#** @function sendExecutionResults( $state, \%ref)
# @brief Get the current VM assessment state, parse it and send it to the updateExecutionResults method
#
# @param state Current VM state
# @param ref Reference to a hash to be populated. This hash will be sent to updateExecutionResults
# @return undef.
#*
sub sendExecutionResults {
    my $state = shift;
    my $ref   = shift;
    my $output;
    my $status;
	if ($isBaTLab) {
		return;
	}
    my $results = getSingleExecutionRecord( $bog{'execrunid'} );
    state $lastCall = 0;

    if ( $results->{'execute_node_architecture_id'} eq 'unknown' ) {
        ( $output, $status ) = systemcall('uname -a');
        if ( !$status ) {
            chomp $output;
            $results->{'execute_node_architecture_id'} = $output;
        }
    }
    $results->{'cpu_utilization'} =
      'd__' . $ref->{'cpu_time'};    # Java XMLRPC client can't do numbers

    if ($state eq 'started') {
        $results->{'vm_hostname'} = "$vmname.$vmdomain";
        $results->{'vm_username'} = $builderUser;
        $results->{'vm_password'} = $builderPassword;
    }
    else {
        $results->{'vm_hostname'} = q{};
        $results->{'vm_username'} = q{};
        $results->{'vm_password'} = q{};
    }

    # Regardless of whether or not we can get 'run.out' from the VM, we need to say the run is Finished.
    if ( $state eq 'shutdown' || $state eq 'stopped' ) {
        $results->{'completion_date'} = scalar localtime;
        $results->{'status'}          = 'Post-processing';
    }

    if ( abs( time - $lastCall ) > main->RETRY_RATE ) {
        $lastCall = time;

        # TODO windows7 will require a different means of accessing /mnt/out/run.out
        ( $output, $status ) =
          systemcall("export LIBGUESTFS_ATTACH_METHOD=libvirt; guestfish --ro --mount /dev/sdc:/mnt/out --mount /dev/sdb:/mnt/in -d $vmname -i cat /mnt/out/swamp_run.out 2>&1");
        if ( !$status ) {
            $nRestarts = 0;    # Clean slate.
            setDeadman(1);  # Reset the timer, we have communications.
            # The scalar $output will have all of the stuff in it from the VM run.out
            # This consists of lines_of_code.
            parseRun( \%bog, $output, $results, packageType( \%bog ) );
        }
        else {
            infoMessage( $bog{'execrunid'},
                "Cannot get swamp_run.out from $vmname: $status ($state) output: $output" );
        }
    }

    updateExecResultsAndEventlog( $bog{'execrunid'}, $results );

    return;
}

sub removeStateFile {
    my $domname = shift;
    my $statefile = getDomainStateFilename( $basedir, $domname );
    if ( unlink($statefile) != 1 ) {
        warnMessage( $bog{'execrunid'}, "Unable to remove state file $statefile: $OS_ERROR" );
    }
    return;
}

sub localGetDomainStatus {
    my $domname   = shift;
    my $statefile = abs_path("$basedir/run/$domname.state");

    # There should be a state file, but there is not.
    if ( !-r $statefile ) {
        return { 'domainstate' => 'UNKNOWN' };
    }
    my $root = lock_retrieve($statefile);
    return $root;

}

#** @function checkDeadman( )
# @brief Check the deadman timer on the VM and if it has expired,
# try to restart N times. If after N failures, give up.
#
# @return
# @see
#*
sub checkDeadman {
    my $now = time;
    my $ret = 0;
    if ( numberStarts() < main->MAX_RESTARTS ) {

        # If we get no response, kick the VM over.
        if ( abs( $now - getDeadman() ) > main->MAX_WAITSTUCK ) {
            $ret = restartVM(1);
            $log->info("Restarting VM");
        }
        else {
            $ret = 1;
        }
    }
    return $ret;
}

#** @function doWaitLoop( )
# @brief Block until our VM shuts down or the deadman timer goes off.
#
# @return 1 if all is well, 0 if the VM is stuck.
#*
sub doWaitLoop {
    my $execrunid;

    my $quitLoop = 0;
    my $lastPoll = 0;
    my $ret      = 0;
    while ( !$quitLoop ) {
        if ( !checkDeadman() ) {
            $quitLoop = 1;
            $log->info("Exiting loop because of deadMan");

            updateExecResultsAndEventlog(
                $execrunid,
                {
                    'status'                       => 'Failed to start VM.',
                    'run_date'                     => scalar localtime,
                    'completion_date'              => scalar localtime,
                    'cpu_utilization'              => 'd__0',
                    'lines_of_code'                => 'i__0',
                    'execute_node_architecture_id' => `uname -a`
                }
            );

            $ret = 0;
            last;
        }

        my $rootref      = localGetDomainStatus($vmname);
        my $currentState = $rootref->{'domainstate'};

        if ( !checkState($currentState) ) {
            $log->warn("domain state for $vmname has been UNKNOWN for too long");
        }
        if ( $currentState eq 'started' ) {

            # If it's been more than 10 seconds and the VM is
            # running
            if ( time - $lastPoll > 10 ) {
                sendExecutionResults( $currentState, $rootref );
                $lastPoll = time;
            }

        }
        elsif ( $currentState eq 'shutdown' || $currentState eq 'stopped' ) {
            sendExecutionResults( $currentState, $rootref );
            $log->info("Exiting loop because VM shutdown");
            $quitLoop = 1;
            $ret      = 1;
            last;
        }
        sleep 5;
    }
    return $ret;
}

#** @function checkState( )
# @brief Examine current VM state. Return 1 if the loop should continue, 0 if the wait loop should exit.
# This is intended to be called only from the doWaitLoop.
# If we are in UNKNOWN state for more than 2 minute, something
# has gone wrong and we need to just exit.
#
# @param state Current state as reported by libvirt
# @return 0 or 1
#*
sub checkState {
    my $state = shift;
    state $inUnknown = time;

    if ( $state eq 'UNKNOWN' ) {
        if ( ( time - $inUnknown ) > 120 ) {
            return 0;
        }
    }
    else {    # Any state other than UNKNOWN resets the counter
        $inUnknown = time;
    }
    return 1;
}

{
    #** @var $vmDeadman the timer started when we launch our VM. This is part of a
    # deadman timer watching for feedback from the VM. No feedback is assumed to be a
    # failure to launch. Effective 4.9.2014 this is a one-shot timer, until some of the
    # loss of communications can be explained by Infrastructure.

    my $vmDeadman;
    #** @var $timerOff Flag that allows the client to turn off the deadman timer so that it can 
    # behave as a one-shot timer.
    my $timerOff = 0;

    sub getDeadman {
        if ($timerOff) {
            $vmDeadman = time;
        }
        return $vmDeadman;
    }

    sub setDeadman {
        $timerOff = shift;
        $vmDeadman = time;
        return;
    }
}

sub numberStarts {
    return $nRestarts;
}

sub restartVM {
    my $needDestroy = shift;
    my $ret         = 0;
    $nRestarts++;

    my $output;
    my $status = 0;
    if ($needDestroy) {
        ( $output, $status ) = systemcall("virsh destroy $vmname");
    }
    if ( !$status ) {
        ( $output, $status ) = systemcall("virsh start $vmname");
        if ($status) {
            $log->error("Unable to start stuck VM $vmname");
        }
        else {
            $ret = 1;
            my $startTime = time;
            while (abs(time - $startTime) < main->MAX_WAITSTUCK) {
                sleep 10;
                my $rootref      = localGetDomainStatus($vmname);
                my $currentState = $rootref->{'domainstate'};
                if ( $currentState ne 'shutdown' && $currentState ne 'stopped' ) {
                    $log->info("VM has restarted: $currentState");
                    last;
                }
            }
            setDeadman(0);
            $log->info("Restarted stuck VM $vmname $nRestarts times.");
        }
    }
    else {
        $log->error("Unable to destroy stuck VM $vmname $status: ($output)");
    }
    return $ret;
}

sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

sub logfilename {
    ( my $name = $appname ) =~ s/\.pl//sxm;
    $name = basename($name);
    return "$basedir/log/${name}.log";
}

sub isMIRToolchain {
    my $bogref = shift;
    if ( !defined( $bogref->{'toolchain'} ) ) {
        return 0;
    }
    return ( $bogref->{'toolchain'} eq 'MIR' );
}

sub taskShutdown {
    if ( defined($vmid) ) {    # If vmid is still defined our VM is viable.
        removeDomainPIDFile($PID, $vmname);
        my $statefile = getDomainStateFilename( $basedir, $vmname ) . q{.died};
        if ( open( my $fh, '>', $statefile ) ) {
            print $fh "Caught signal @_, shutting down\n";
            if ( !close($fh) ) {
                # nothing to do, we're shutting down.
            }
        }
    }

    # Try and clean up.
    cleanupWorkingSpace();
    croak "Caught signal @_, shutting down";
}

sub configureClients {
    my $aHost  = shift;
    my $aPort  = shift;
    my $dHost  = shift;
    my $dPort  = shift;
    my $config = getSwampConfig();
    if ( !defined($aPort) ) {
        $aPort = int( $config->get('agentMonitorJobPort') );
    }
    if ( !defined($aHost) ) {
        $aHost = $config->get('agentMonitorHost');
    }

    if ( defined($aPort) && defined($aHost) ) {
        SWAMP::Client::AgentClient::configureClient( $aHost, $aPort );
    }

    if ( !defined($dPort) ) {
        $dPort = int( $config->get('dispatcherPort') );
    }
    if ( !defined($dHost) ) {
        $dHost = $config->get('dispatcherHost');
    }

    if ( defined($dHost) && defined($dPort) ) {
        infoMessage( 'undef id', "configuring ResultCollector on $dHost:$dPort" );
        SWAMP::Client::ResultCollectorClient::configureClient( $dHost, $dPort );
        SWAMP::Client::ExecuteRecordCollectorClient::configureClient( $dHost, $dPort );
    }
    return;
}

{
    my $workingspace;

#** @function setupWorkingSpace( $suffix )
# @brief Based on the desired resultsFolder in the swamp.conf, build and chdir to a temp space in the resultsFolder tree.
#
# @param suffix The folder we should  use. This should be unique in a SWAMP instance.
# @return 1 if we succeeded, 0 otherwise. The assessment will fail if we return 0.
#*
    sub setupWorkingSpace {
        my $suffix = shift;
        my $config = getSwampConfig();

        $vmdomain = $config->get("vmdomain") // q{vm.cosalab.org};

        if ($isBaTLab) {
            $workingspace = getcwd;
        }
        else {
            $workingspace = $config->get("resultsFolder") // q{.};
        }
        $workingspace = File::Spec->catfile( $workingspace, q{temp}, $suffix );
        make_path( $workingspace, { 'error' => \my $err } );
        if ( @{$err} ) {
            for my $diag ( @{$err} ) {
                my ( $file, $message ) = %{$diag};
                if ( $file eq q{} ) {
                    errorMessage( 'undef id',
                        "Cannot make working folder [$workingspace]: $message" );
                }
                else {
                    errorMessage( 'undef id',
                        "Cannot make working folder [$workingspace]: $file $message" );
                }
            }
            return 0;
        }
        if (!$isBaTLab) {
            my ( $output, $status ) = systemcall("tar -C $workingspace -xf input*.tgz");
            if ($status) {
                $log->error("Cannot extract input to $workingspace  : $status $OS_ERROR $output");
                return 0;
            }
        }
		if (-r '.chirp.config') {
            cp('.chirp.config', $workingspace);
		}
        chdir $workingspace;
        if ( getcwd() ne abs_path($workingspace) ) {
            $log->error("Cannot chdir to input to $workingspace  : $OS_ERROR ".getcwd()." = " .abs_path($workingspace));
            return 0;
        }
        return 1;
    }

#** @function cleanupWorkingSpace( )
# @brief Remove the working space set up by #setupWorkingSpace()
# This used to be done by HTCondor, but now that we're using a space of our own, this process needs to clean up
# after itself.
#*
    sub cleanupWorkingSpace {
	if ($startupdir) {
		chdir $startupdir;
	}
        if ($workingspace) {
            $log->info("Cleaning up $workingspace" . `find $workingspace`);
            remove_tree($workingspace);
        }
        return;
    }
}
__END__
=pod

=encoding utf8

=head1 NAME

assessmentlauncher

=head1 SYNOPSIS

assessmentlauncher [--bog bogfilename] [--debug] [--out outputresultsfilename]
[--resultfile resultfile] [--outputfile outfile.tar.gz] [--inputfolder folder]
[--platform platform] [--vmfolder folder ] [--vmimagefolder imagefolder] [--cpu #cpu] [--mem memMB] [--vmname name]

=head1 DESCRIPTION

The  Assessment Task is the executable specified in the HTCondor job by the CSAAgent

The Assessment task is the CSA Agent portion that runs on the execute
node. It is responsible to creating the VM that will perform the
assessment.  When the VM finishes, as indicated by the Domain Monitor,
the Assessment Task will extract the results from the VM. If the run
failed, the VM will be optionally preserved, otherwise the VM will be
reaped. The Assessment Task can then exit. 

It is responsible for:

=over 4

=item *

Creating the Virtual Machine (VM) from the provided 'input' file(s) and platform

=item *

Starting the VM

=item * 

Monitoring the VM while it is running. 

=item *

Ensuring that if HTCondor goes away, we clean up appropriately

=item *

Sending status and results back the AgentMonitor

=item *

Reap the VM 

=back

=head1 OPTIONS

=over 8

=item B<--debug>

enable debug level logging

=item B<--bog I<file>>

The name of the bogfile, this is a Bill Of Goods property file generated by the
agent running on the submit node and defined the assessment. If this file is
not present, it is assumed that this assessment is a BaTLab job and only a
platform and input folder are expected.

=item B<--cpu I<nCPU>>

Specify the number of CPU(s) for the virtual machine running the assessment.
Maximum depends on hypervisor.

=item B<--mem I<nMB>>

Specify amount of memory for the virtual machine running the assessment, in
megabytes. Maximum depends on the available memory on the hypervisor.

=item B<--resultfile I<file>>

Causes the launcher to terminate with the (ASCII-encoded) value in
<filename>, or run.result if unspecified.  Useful for working with job
management systems. This option is ignored unless inputfolder is
specified.

=item B<--inputfolder I<folder>>

Specify an existing folder to use as /mnt/in in the virtual machine. If
this option is specified, the folder is used as-is.

=item B<--outputfile I<outfile.tar.gz>>

The name of the file which will contain the
contents of /mnt/out as a Gzip compressed tarball. 

=item B<--platform I<platform>>

The platform on which the VM should be based, this
is one of the strings output from 'start_vm --list'

=item B<--vmimagefolder I<imagefolder>>

The folder that contains the VM master images. The default is /var/lib/libvirt/images

=item B<--vmfolder I<folder>>

The folder than should be used for storage of the VM backing file (e.g. qcow2
images) while the VM is running. The default is /swamp/project/B<vmname>

=item B<--vmname I<name>> 

Name of the VM. 

=item B<--man>

Show manual page for this script

=back

=cut
