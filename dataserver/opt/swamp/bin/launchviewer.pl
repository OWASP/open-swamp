#!/usr/bin/env perl 
#** @file calldorun.pl
#
# @brief This script launches a viewer
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 09/25/2013 13:38:55
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

use 5.014;
use utf8;
use warnings;
use strict;
use FindBin;
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );

use Carp qw(carp croak);
use Cwd qw(getcwd abs_path);
use English '-no_match_vars';
use File::Basename qw(basename fileparse);
use File::Copy qw(move cp);
use File::Path qw(make_path remove_tree);
use File::Spec qw(devnull catfile);
use Getopt::Long qw/GetOptions/;
use Log::Log4perl::Level;
use Log::Log4perl;
use POSIX qw(:sys_wait_h WNOHANG);    # for nonblocking read
use POSIX qw(setsid waitpid);
use Pod::Usage qw/pod2usage/;
use Sys::Hostname qw(hostname);
use XML::LibXML;
use XML::LibXSLT;

use SWAMP::SWAMPUtils
  qw(diewithconfess getLoggingConfigString getSwampConfig getSWAMPDir getBuildNumber makezip);
use SWAMP::RPCUtils qw(okReturn);
use SWAMP::Client::AgentClient qw(configureClient isViewerAvailable launchViewer abortViewer);
use SWAMP::Client::GatorClient qw(configureClient updateviewerinstance);
use SWAMP::CodeDX qw(uploadanalysisrun);
use SWAMP::FrameworkUtils qw(generatereport savereport);
use SWAMP::PackageTypes qw($GENERIC_PKG $JAVABYTECODE_PKG);

use constant 'OK'      => 1;
use constant 'NOTOK'    => 0;
use constant 'ERROR'   => -1;
use constant 'TIMEOUT' => 2;

my $help       = 0;
my $man        = 0;
my $startupdir = getcwd;
my $asdaemon   = 1;
my $debug      = 0;

#** @var $inputdir The absolute path location where raw results can currently be found.
my $inputdir;

#** @var $outputdir optional folder into which results will be written. Currently this is only for the Native viewer
my $outputdir;

#** @var $viewer_name The textual name of the view to invoke. Native or CodeDX.
my $viewer_name;
my $invocation_cmd;
my $sign_in_cmd;
my $add_user_cmd;
my $add_result_cmd;
my $viewer_path;
my $viewer_checksum;
my $viewer_db_path;
my $viewer_db_checksum;
my $viewer_uuid;
my @file_path;
my $source_archive;
my $tool_name;       # SWAMP Toolname
my $package_name;    # SWAMP package affiliation == CodeDX project
my $project_name;    # SWAMP project affiliation

our $VERSION = '1.00';
my $package_type = $GENERIC_PKG;    # Assume its some sort of source code.

GetOptions(
    'help|?'                => \$help,
    'man'                   => \$man,
    'viewer_name=s'         => \$viewer_name,
    'invocation_cmd=s'      => \$invocation_cmd,
    'sign_in_cmd=s'         => \$sign_in_cmd,
    'add_user_cmd=s'        => \$add_user_cmd,
    'add_result_cmd=s'      => \$add_result_cmd,
    'viewer_path=s'         => \$viewer_path,
    'viewer_checksum=s'     => \$viewer_checksum,
    'viewer_db_path=s'      => \$viewer_db_path,
    'viewer_db_checksum=s'  => \$viewer_db_checksum,
    'viewer_uuid=s'         => \$viewer_uuid,
    'indir=s'               => \$inputdir,
    'file_path=s'           => \@file_path,
    'source_archive_path=s' => \$source_archive,
    'tool_name=s'           => \$tool_name,
    'outdir=s'              => \$outputdir,
    'package=s'             => \$package_name,
    'package_type=s'        => \$package_type,
    'project=s'             => \$project_name,
    'daemon!'               => \$asdaemon,
    'debug'                 => \$debug,
) or pod2usage(2);
if ($help) { pod2usage(1); }
if ($man) { pod2usage( '-verbose' => 2 ); }
# This script is normally invoked from within the dataserver, to prevent delays
# fork() and return immediately to the caller.
if ( $viewer_name =~ /CodeDX/ixsm ) {
	print "SUCCESS\n";
    chdir(q{/});
    open( STDIN, '<', File::Spec->devnull )
      || croak "can't read /dev/null: $OS_ERROR";
    open( STDOUT, '>', File::Spec->devnull )
      || croak "can't write to /dev/null: $OS_ERROR";
    defined( my $pid = fork() ) || croak "can't fork: $OS_ERROR";
    exit 0 if $pid;    # non-zero now means I am the parent
    ( setsid() != -1 ) || croak "Can't start a new session: $OS_ERROR";
    open( STDERR, ">&STDOUT" ) || carp "Can't open STDERR $OS_ERROR";

}
chdir($startupdir);

Log::Log4perl->init( getLoggingConfigString() );

my $log = Log::Log4perl->get_logger(q{});
$log->level( $debug ? $TRACE : $INFO );

# Turn off logging to Screen appender
Log::Log4perl->get_logger(q{})->remove_appender('Screen');

# Catch anyone who calls die.
local $SIG{'__DIE__'} = \&diewithconfess;

my $ver = "$VERSION." . getBuildNumber();
$log->info("$PROGRAM_NAME v$ver: launchviewer:$viewer_name");

my $config     = getSwampConfig();
my $serverPort = $config->get('agentMonitorJobPort');
my $serverHost = $config->get('agentMonitorHost');
SWAMP::Client::AgentClient::configureClient( $serverHost, $serverPort );

SWAMP::Client::GatorClient::configureClient($config->get('quartermasterHost'), $config->get('quartermasterPort'));

my $exitCode = 0;
if ( $viewer_name =~ /Native/ixsm ) {
    $exitCode = doNative();
}
elsif ( $viewer_name =~ /CodeDX/isxm ) {
    $exitCode = doCodeDX();
}
else {
    $log->error("viewer '$viewer_name' not supported.");
    exit 1;
}

exit $exitCode;

sub doCodeDX {
    my $start_time = time();
    my $retCode     = NOTOK;
    my $launchTried = 0;
    $log->info("doCodeDX: $retCode");
    my $viewerIsAvailable = 0;
    my $viewerStatus;
    my $removeZip = 0;
    updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatus' => q{Launching viewer} });
    if ( $source_archive && $source_archive !~ /\.zip$/sxm ) {
        $source_archive = makezip( abs_path($source_archive) );

        # If the name was changed to zip form, remove the zip
        # when finished
        if ( $source_archive =~ /\.zip$/sxm ) {
            $removeZip = 1;
        }
    }
#    defined( my $pid = fork() ) || croak "can't fork: $OS_ERROR";
#    if ($pid) {    # non-zero now means I am the parent, parent returns and lets the child finish
#    }
#else {
#        say "SUCCESS";
#        $log->info("child $pid exiting");
#        return OK;
#}

    # This loop runs until it times out -OR- the viewer launches.
    my $available_time = time();
    my $sleep_total = 0;
    while ( !$viewerIsAvailable ) {
	$log->info("Calling isViewerAvailable: $project_name");
        $viewerStatus = isViewerAvailable( 'project' => $project_name, 'viewer' => $viewer_name );
	$log->info("Back from isViewerAvailable: $project_name viewerStatus: ", $viewerStatus->{'ready'});
        if ( defined( $viewerStatus->{'error'} ) ) {
            $log->info("Error checking for viewer");
            updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatuscode' => q{1}, 'viewerstatus' => q{Error checking for viewer} });
            $retCode = ERROR;
            last;
        }
        if ( $viewerStatus->{'ready'} == 1 ) {
            updateviewerinstance({'vieweruuid' => $viewer_uuid, 
                'vieweraddress' => $viewerStatus->{'address'},
                'viewerproxyurl' => $viewerStatus->{'urluuid'},
                'viewerstatus' => q{Found available viewer} } ); 
            $viewerIsAvailable = 1;
            $retCode           = OK;
            last;
        }

        $log->info("doCodeDX isViewerAvailable[", $launchTried, "]: no viewer available $retCode");

        # launchViewer only starts the process of launching the viewer,
        # still need to wait for it to be running.
        if ( !$launchTried ) {
            my %launchMap = (
                'resultsfolder' => $config->get('resultsFolder'),
                'project'       => $project_name,
                'viewer'        => $viewer_name,
                'viewer_uuid'   => $viewer_uuid,
            );

            # It is OK to not have a viewer_db_path, it just means this is a NEW VRun VM.
            if ( defined($viewer_db_path) && $viewer_db_path ne q{NULL} ) {
                $launchMap{'db_path'} = $viewer_db_path;
            }
	    my $launch_time = time();
	    $log->info("Calling launchViewer RPC");
            $retCode = launchViewer(%launchMap);
	    $log->info("LAUNCHVIEWER TIME: Back from launchViewer RPC: $retCode seconds: ", time() - $launch_time);
        }
        if ( $retCode != OK ) {
            $log->error("Unable to launch viewer $retCode");
            updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatuscode' => q{0}, 'viewerstatus' => q{Unable to launch viewer} });
            last;
        }
        else {
            $launchTried++;
        }

        updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatus' => q{Launching viewer} });
        $sleep_total += 10;
        sleep 10;    # Wait for the viewer to launch, 60 * 10 seconds
        if ( $launchTried > 60 ) {
            $retCode = TIMEOUT;
            updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatuscode' => q{1}, 'viewerstatus' => q{Failed to launch viewer: timed out} });
            $log->error("Failed to launch viewer in a timely manner");
            last;
        }
    }
    $available_time = time() - $available_time;
    $log->info("LAUNCHVIEWER TIME: doCodeDX:back from isViewerAvailable attempts: $launchTried - retCode: $retCode seconds: ", $available_time, " sleep: $sleep_total process: ", $available_time - $sleep_total);

    if ( $retCode == OK ) {
        if ($package_name) {
            if ($package_type && $package_type ne $JAVABYTECODE_PKG) {
                push @file_path, $source_archive;
            }
            updateviewerinstance({'vieweruuid' => $viewer_uuid,
                'vieweraddress' => $viewerStatus->{'address'},
                'viewerproxyurl' => $viewerStatus->{'urluuid'},
                'viewerstatus' => q{Uploading results to Code Dx} });
	    $log->info("Calling uploadanalysisrun systemcall");
	    my $upload_time = time();
            $retCode = uploadanalysisrun(
                $viewerStatus->{'address'},
                $viewerStatus->{'apikey'},
                $viewerStatus->{'urluuid'},
                $package_name, \@file_path
            );
	    $log->info("LAUNCHVIEWER TIME: Back from uploadanalysisrun systemcall: $retCode seconds: ", time() - $upload_time);
        }
        $log->info("LaunchViewer for CodeDX: $viewerStatus->{urluuid} $retCode");
        if ( $retCode == OK ) {
            updateviewerinstance({'vieweruuid' => $viewer_uuid,
                'viewerstatus' => q{Code Dx launched successfully} ,
                'viewerstatuscode' => q{0},
                'vieweraddress' => $viewerStatus->{'address'},
                'viewerproxyurl' => $viewerStatus->{'urluuid'} });
            print "$viewerStatus->{'urluuid'} $viewerStatus->{'address'}\n";
        }
        else {
            print "ERROR Uploading results to Code Dx\n";
            $log->error("Unable to upload results to Code Dx: $retCode");
            updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatuscode' => q{1}, 'viewerstatus' => q{Unable to upload results to Code Dx},
                'vieweraddress' => $viewerStatus->{'address'},
                'viewerproxyurl' => $viewerStatus->{'urluuid'} });
        }
    }
    else {
        print "ERROR Unable to launch viewer $viewer_name\n";
        abortViewer( 'project' => $project_name, 'viewer' => $viewer_name );
        updateviewerinstance({'vieweruuid' => $viewer_uuid, 'viewerstatuscode' => q{1}, 'viewerstatus' => q{Unable to launch viewer} });
        $log->warn("doCodeDX: aborting viewer for [$project_name][$viewer_name] ret=$retCode");
    }
    if ($removeZip) {

        # Remove zip regardless of viewer status
        unlink $source_archive;
    }
    $log->info("LAUNCHVIEWER TIME: doCodeDX returns: $retCode seconds: ", time() - $start_time, "\n\n");
    if ( $retCode == OK ) {
        $retCode = 0;
    }
    elsif ( $retCode == NOTOK ) {
        $retCode = 1;
    }
    return $retCode;
}

# Native viewer needs to look at the report XML file found in $inputdir
sub doNative {
    my $retCode = 0;
    foreach my $file (@file_path) {
        my ( $htmlfile, $dir, $ext ) = fileparse( $file, qr/\.[^.].*/sxm );
        my $filetype = `file $file`;

        if ( $filetype !~ /XML\s*doc/sxm ) {
            $log->info("File $file: not XML");
            make_path($outputdir);
            if ( cp( $file, $outputdir )) {
                $log->info("Copied $file to $outputdir ret=[${htmlfile}${ext}]");
                my %report = generatereport("$outputdir/${htmlfile}${ext}");
                savereport(\%report, "$outputdir/assessmentreport.html", $config->get('reporturl'));
                system("/bin/chmod 644 $outputdir/assessmentreport.html");
                print "assessmentreport.html\n";
            }
            else {
                $log->error("Cannot copy $file to $outputdir $OS_ERROR");
                print "ERROR Cannot copy $file to $outputdir $OS_ERROR\n";
                $retCode = 3;
            }
            next;
        }
        my $isCommon = 1;
        if ( system("head $file|grep -q '<AnalyzerReport'") != 0 ) {
            $isCommon = 0;
        }
        my $xsltfile = getXSLTFile( $tool_name, $isCommon );
        $log->info("Transforming  $file with $xsltfile");

        my $xslt = XML::LibXSLT->new();
        my $source;

        # Wrap this in an eval to catch any exceptions parsing output from the assessment.
        my $success = eval { $source = XML::LibXML->load_xml( 'location' => $file ); };
        if ( defined($success) ) {
            my $style_doc  = XML::LibXML->load_xml( 'location' => "$xsltfile", 'no_cdata' => 1 );
            my $stylesheet = $xslt->parse_stylesheet($style_doc);
            my $results    = $stylesheet->transform($source);
            my $filename   = q{nativereport.html};
            $log->info("Creating  $outputdir/${filename}");
            make_path($outputdir);
            $stylesheet->output_file( $results, "$outputdir/${filename}" );
            print "${filename}\n";
        }
        else {
            $log->error("Loading $file threw an exception.");
            print "ERROR Cannot load $file as XML document\n";
            $retCode = 2;
        }
    }
    return $retCode;
}

sub checkOpt {
    my $ref     = shift;
    my $key     = shift;
    my $optname = shift;
    if ( !defined( $ref->{$key} ) ) {
        print "ERROR --$optname is required\n";
        return 1;
    }
    return 0;
}

sub validateOptions {
    my %options = (@_);
    my $sumRet  = 0;
    #$sumRet += checkOpt( \%options, q{tool}, q{tool_name} );

    #$sumRet += checkOpt( \%options, q{package}, q{package} );
    #$sumRet += checkOpt( \%options, q{project}, q{project} );
    $sumRet += checkOpt( \%options, q{viewer}, q{viewer_name} );
    if ( defined( $options{'files'} ) ) {
        if ( $options{'files'} <= 0 ) {
            print "ERROR --file_path is required\n";
            $sumRet++;
        }
    }
    return $sumRet;
}

sub getXSLTFile {
    my $tool     = shift;
    my $isCommon = shift;
    my $xsltfile;
    my $suffix = q{};
    if ($isCommon) {
        $suffix = q{_common};
    }
    my %lookup = ( 'PMD' => 'pmd', 
        'Findbugs' => 'findbugs',
        'Archie' => 'archie',
        'error-prone' => 'generic',
        'checkstyle' => 'generic',
        'Pylint' => 'generic',
        'cppcheck' => 'cppcheck',
        'clang' => 'clang-sa',
        'gcc' => 'gcc');
    foreach my $key (keys %lookup) {
        if ($tool =~ /$key/isxm) {
            $xsltfile = "$lookup{$key}${suffix}.xslt";
            last;
        }
    }
	if (! $xsltfile) {
		$xsltfile = 'generic_common.xslt';
	}
    return File::Spec->catfile( getSWAMPDir(), 'etc', $xsltfile );
}

sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

sub logfilename {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    $name = basename($name);
    return getSWAMPDir() . "/log/${name}.log";
}

__END__
=pod

=encoding utf8

=head1 NAME

launchviewer.pl - Launch result viewer for Assessment Results.

=head1 SYNOPSIS

launchviewer.pl --viewer_name name --file_path resultfile [--tool_name toolname] [--source_archive_path sourcefile ] [--outdir outdir] [--invocation_cmd command] [--sign_in_cmd command] [--add_user_cmd command] 
[--add_result_cmd command] [--viewer_path path --viewer_checksum checksum] [--viewer_db_path path --viewer_db_checksum checksum]

=head1 DESCRIPTION

This script is invoked to launch a result viewer for assessment results given a predefined viewer.

=head1 OPTIONS

=over 8

=item --viewer_name B<name>

Name of the view to launch: Native, CodeDX

=item --source_archive_path F<sourcefile>

The absolute path to the file containing the assessment source archive. 

=item --file_path F<resultfile>

The absolute path to the file containing the input assessment report. For now, this will be a single file, but for CodeDX, multiple input files can be specified.

=item --tool_name I<toolname>

The name of the assessment tool used

=item --outdir F<outdir>

The absolute path to the directory to write results (HTML reports)

=item --invocation_cmd C<command>

Command used to launch viewer

=item --sign_in_cmd C<command>

Command used to authenticate a user

=item --add_user_cmd C<command>

Command used to add a user to a viewer

=item --add_result_cmd C<command>

Command used to add a result to a viewer

=item --viewer_path F<path>

The viewer's image

=item --viewer_checksum I<checksum>

Checksum (sha512sum) of the viewer's image

=item --viewer_db_path F<path>

absolute path of the viewer's database image

=item --viewer_db_checksum I<checksum>

Checksum (sha512sum) of the viewer's database image

=item --help

Show help for this script

=item --man

Show manual page for this script

=back

=cut


