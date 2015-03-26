#!/usr/bin/env perl
#** @file DomainMonitor
# @brief DomainMonitor
#
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

#** @class main
# @brief This application monitors all virtual machines `VMs` on a single hypervisor and persists VM state for use by
# the assessment task.
#*
use 5.014;
use utf8;
use warnings;
use strict;
use FindBin qw($Bin);
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );
use sigtrap 'handler', \&taskShutdown, 'normal-signals';

require RPC::XML;
require RPC::XML::Client;

use Carp qw(croak carp);
use Cwd qw(abs_path);
use English '-no_match_vars';
use Fcntl qw(:flock);
use File::Basename qw(basename);
use File::Find ();
use File::Spec qw(catfile);
use Getopt::Long qw/GetOptions/;
use Log::Log4perl;
use Log::Log4perl::Level;
use Pod::Usage qw/pod2usage/;
use POSIX qw(:sys_wait_h WNOHANG);    # for nonblocking read
use POSIX qw(setsid waitpid);
use Socket qw(inet_ntoa);
use Storable qw(lock_nstore);
use Sys::Hostname qw(hostname);

# for accessing Libvirt
use Sys::Virt;
use Sys::Virt::Domain;
use Sys::Virt::Event;
use SWAMP::SysVirtEvents qw(getEventInformation);

use SWAMP::Client::AgentClient qw(configureClient agentLogState execNodePing);
use SWAMP::AssessmentTools qw(warnMessage errorMessage infoMessage);
use SWAMP::SysUtils qw(sysinfo);
use SWAMP::SWAMPUtils qw(
  diewithconfess
  getBuildNumber
  getDomainStateFilename
  getLoggingConfigString
  getSwampConfig
  getSWAMPDir
  pid_extension
  readDomainPIDFile
  systemcall
  uname
);

our $VERSION = '1.00';

#** @var $basedir The absolute path of the parent of where this program is run.
my $basedir = abs_path("$FindBin::Bin/..");

## no critic (ProhibitCallsToUndeclaredSubs)
# Check for an instance of ourself
open my $self, '<', $PROGRAM_NAME or croak "Couldn't open self: $OS_ERROR";
flock $self, ( LOCK_EX | LOCK_NB ) or exit 0;
## use critic

my %running;
my $doversion = 0;
my $port;
my $debug = 0;
my $serverAgent;
my $help = 0;
my $man  = 0;

#** @var $uri The process ID of our watching process. If this process dies, we should exit as soon as possible.
my $watcherpid = 0;

#** @var $uri The URI of libvirt. Typically the default suffices.
my $uri;

#** @var $quitLoop Flag indicating the loop watching the VM should exit.
my $quitLoop = 0;

use constant {
    'BEAT_FREQ' => 10,    # Number of seconds between alive signals. Dead signals are immediate.
};

GetOptions(
    'port=s'       => \$port,
    'libvirturi'   => \$uri,
    'host=s'       => \$serverAgent,
    'debug'        => \$debug,
    'V|version'    => \$doversion,
    'help|?'       => \$help,
    'watcherpid=i' => \$watcherpid,
    'man'          => \$man,
) or pod2usage(2);

if ($help) { pod2usage(1); }
if ($man) { pod2usage( '-verbose' => 2 ); }
if ($doversion) {
    printf "%20s : %6s\n", basename($PROGRAM_NAME), $VERSION;
    printf "%20s : %6s\n", 'AgentClient',     $SWAMP::Client::AgentClient::VERSION;
    printf "%20s : %6s\n", 'AssessmentTools', $SWAMP::AssessmentTools::VERSION;
    printf "%20s : %6s\n", 'SWAMPUtils',      $SWAMP::SWAMPUtils::VERSION;
    exit 0;
}

savePIDFile();
Log::Log4perl->init( getLoggingConfigString() );

# Catch anyone who calls die.
local $SIG{'__DIE__'} = \&diewithconfess;

my $log = Log::Log4perl->get_logger(q{});
$log->level( $debug ? $TRACE : $INFO );
$log->remove_appender('Screen');

my $config = getSwampConfig();
if ( !defined($port) ) {
    $port = int( $config->get('agentMonitorJobPort') );
}
if ( !defined($serverAgent) ) {
    $serverAgent = $config->get('agentMonitorHost');
}

if ( defined($port) && defined($serverAgent) ) {
    SWAMP::Client::AgentClient::configureClient( $serverAgent, $port );
}

## no critic (ProhibitCallsToUnexportedSubs)
Sys::Virt::Event::register_default();
## use critic

my $vmm = Sys::Virt->new( 'uri' => $uri, 'readonly' => 1 );

my $ver = "$VERSION." . getBuildNumber();
$log->info("$PROGRAM_NAME: v$ver sending to $serverAgent on port: $port");

## no critic (ProhibitCallsToUnexportedSubs)
$vmm->domain_event_register_any(
    undef, Sys::Virt::Domain::EVENT_ID_LIFECYCLE,
## use critic
    \&lifecycle_event
);

## no critic (ProhibitCallsToUnexportedSubs)
$vmm->register_close_callback(
## use critic
    sub {
        my $con    = shift;
        my $reason = shift;
        warnMessage( 'register_close_callback', "shutting down: closed reason=$reason" );
        $quitLoop = 2;
    }
);

# Before entering the run loop, check the state of all know VMs and persist their state.
# This is to handle the situation where we have running VMs and DomainMonitor is killed by libvirtd errors
# and has to wake back up immediately.
startupMonitor();

# We are now running continuously
while ( !$quitLoop ) {
    Sys::Virt::Event::run_default();
    if ( $quitLoop == 0 ) {
        updateCPUTimes();
    }
    runAdminTasks();
    my $ret = kill 0, $watcherpid;    # Check out what's up with watcher
    if ( $ret != 1 ) {
        $quitLoop = 1;
        $log->info('Watcher has gone away, shutting down.');
    }
}
if ( $quitLoop & 2 ) {

    # We did not exit on our own.
    warnMessage( 'domain_monitor', "DomainMonitor exiting for nefarious reasons." );
    # Can't hurt to restart libvirtd
    system("/sbin/service libvirtd restart");
}
heartbeatTask( SWAMP::SWAMPUtils->DEAD );
infoMessage( 'domain_monitor', "DomainMonitor exiting normally." );
removePIDFile();

exit 0;

#** @function lifecycle_event( $virt, $dom, $event, $detail)
# @brief The callback for the libvirt library
#
# @param virt The libvirt object
# @param dom The domain to which event applies
# @param event The event that occurred
# @param detail Details about why the event occurred
# @return nothing
#*
sub lifecycle_event {
    my $virt    = shift;
    my $dom     = shift;
    my $event   = shift;
    my $detail  = shift;
    my $domname = $dom->get_name();

    my ( $se, $sr ) = getEventInformation( $event, $detail );
    $running{$domname}->{'state'}  = $se;
    $running{$domname}->{'reason'} = $sr;
    if ( $se eq 'started' || !defined( $running{$domname}->{'cpu_time'} ) ) {
        $running{$domname}->{'cpu_time'} = 0;
    }

    infoMessage( 'domain_monitor', "$domname in state $se ($sr)" );
    saveState( $se, $sr, $domname, $running{$domname}->{'cpu_time'} );

    if ( $se eq 'undefined' ) {
        $log->debug("Deleting key for $domname as it is now undefined");
        delete $running{$domname};
    }

    agentLogState( time, $domname, $se, $sr );

    return;
}

#** @function saveState( $eventString, $reasonString, $domname, $cpu_time)
# @brief Persist a state file for `domname`.
# The assessmentTask.pl#localGetDomainStatus() method reads this file.
#
# @param eventString The current state of the VM `domname`.
# @param reasonString The reason `domname` entered current state
# @param domname The name of the VM of which state is being persisted
# @param cpu_time The current amount of CPU utilization `domname` has used.
# @return undef
#*
sub saveState {
    my $eventString  = shift;
    my $reasonString = shift;
    my $domname      = shift;
    my $cpu_time     = shift // 0;

    # Mash everything into a single hash
    my %state = (
        'cpu_time'    => $cpu_time,
        'stateTime'   => time,
        'domainstate' => $eventString,
        'stateReason' => $reasonString
    );
    lock_nstore( \%state, getDomainStateFilename( $basedir, $domname ) );

    return;
}

#
#** @function oldLogs( )
# @brief Unlink log files older than 7 days. This function was generated by:
# find2perl /opt/swamp/log -name "assessmenttask_*.log" -mtime +7 -exec rm -f {} \;
#
# @return result of the unlink
#*
sub oldLogs {
    my ( $dev, $ino, $mode, $nlink, $uid, $gid );

    return
         /^assessmenttask_.*\.log\z/sxm
      && ( ( $dev, $ino, $mode, $nlink, $uid, $gid ) = lstat($_) )
      && ( int( -M _ ) > 7 )
      && unlink($_);
}

#** @function taskShutdown( )
# @brief General signal handler.
# Invoke heartbeatTask as dead and then croak.
#
#*
sub taskShutdown {
    heartbeatTask( SWAMP::SWAMPUtils->DEAD );
    croak "Caught signal @_, shutting down";
}

#** @function heartbeatTask( $viability )
# @brief Invoke the method execNodePing on the AgentMonitor. This let the AgentMonitor
# know that we are viable.
#
# @param viability String idicating our viability {alive, dead}.
# @return undef if the call could not go thru, otherwise a defined value.
#*
sub heartbeatTask {
    my $viability = shift;
    my $ip;
    my $ok = eval { $ip = inet_ntoa( scalar gethostbyname( hostname() ) ); };
    state $lastRun = 0;

    # Don't inundate the AgentMonitor with repeated information.
    if ( $viability eq SWAMP::SWAMPUtils->ALIVE && ( time - $lastRun ) < main->BEAT_FREQ ) {
        return;
    }
    my ( $nCPU, $nCores, $memMB ) = sysinfo();
    if ( defined($ok) ) {
        execNodePing( $ip, $viability, $nCPU, $memMB );
        $lastRun = time;
    }
    else {
        $log->warn('Unable to obtain my IP');
    }
    return;
}

#** @function reapVMs( $aref )
# @brief Remove VMs named in `aref` from the system
#
# @param aref Reference to a list of files naming VMs to be reaped
# @return nothing
#*
sub reapVMs {
    my $aref = shift;
    foreach my $deadfile ( @{$aref} ) {
        my $vmname = basename($deadfile);
        $vmname =~ s/\.state\.died//sxm;
        reapDomain($vmname);
        unlink $deadfile;
    }
    return;
}

#** @function runAdminTasks( )
# @brief Perform tasks periodically. These include but are not limited to
# * Clean up old log files.
# * Purge any state files, viable ones will be resurrected.
# * Reap any VMs that might be running/left but had their assessment tasks die.
# * Invoke the heartbeatTask().
#*
sub runAdminTasks {

    heartbeatTask( SWAMP::SWAMPUtils->ALIVE );

    my $stateFolder = abs_path("$basedir/run");
    my @deadVMs     = glob "$stateFolder/*.state.died";

    # Need to reap these VMs, their assessment task has gone away.
    if ( $#deadVMs != -1 ) {
        reapVMs( \@deadVMs );
    }

    reapUnwatchedDomains();

    state $lastRun = 0;

    # Run every 24 hours
    # 86400 = 24*60*60 seconds in 24hrs.
    if ( ( time - $lastRun ) < 86_400 ) {
        return;
    }
    $log->info("Performing administrative tasks");

    # Remove all state files. state files for existing domains will be resurrected.
    unlink glob "$stateFolder/*.state";

    # Clean out old log files.
    # N.B. Do not run this anywhere but the logs folder.
    File::Find::find( { 'wanted' => \&oldLogs }, '/opt/swamp/log' );

    $lastRun = time;
    return;
}

#** @function reapUnwatchedDomains( )
# @brief examine every .pid file in the SWAMP 'run' folder. If the PID monitoring a domain is NOT alive, 
# destroy the domain. This is to prevent VMs that have no monitor from running away untethered.
#
# @return nothing
#*
sub reapUnwatchedDomains {
    my $killpattern = File::Spec->catfile( $basedir, 'run', '*.did');
    my @killfiles     = glob $killpattern;
    foreach my $file (@killfiles) {
        my ($pid, $domainname) = readDomainPIDFile($file);
        if ($pid && $domainname) {
            # Check to see if $pid is still running
            if (kill (0, $pid) != 1) { 
                $log->info("domain $domainname has no monitor PID $pid, reaping");
                reapDomain($domainname);
                unlink $file;
            }
        }
    }
    return;
}
sub reapDomain {
    my $domainname = shift;
    my ( $output, $status ) = systemcall("$basedir/bin/vm_cleanup --force  $domainname 2>&1");
    if ($status) {
        $log->warn("Unable to reap VM  $domainname $output");
    }
    return ($status == 0);
}
#** @function startupMonitor( )
# @brief initialize the state of all VMs observed by this monitor. Non existent VMs will have
# their state files erased.
#
# @return 0 if the VM Manager isn't running, 1 otherwise
#*
sub startupMonitor {
    if ( !$vmm->is_alive() ) {
        errorMessage( 'domain_monitor', 'startMonitor called by vmm is not alive.' );
        return 0;
    }
    runAdminTasks();
    my @validDomains = $vmm->list_all_domains();
    foreach my $validDom (@validDomains) {
        my ( $state, $reason ) = $validDom->get_state();
        my ( $se, $sr ) = getEventInformation( $state, $reason );
        my $domname = $validDom->get_name();
        $log->info("Checking on valid domain $domname");
        saveState( $se, $sr, $domname, 0 );
        # Let the agent monitor know the state of all VMs.
        agentLogState( time, $domname, $se, $sr );
    }
    return 1;
}

#** @function updateCPUTimes( )
# @brief Attempt to ask the running VMs cpu_utilization information and save it to the VM's state file
# via #saveState()
#
# @return undef
# @see #saveState()
#*
sub updateCPUTimes {
    if ( !$vmm->is_alive() ) {
        return;
    }
    my @validDomains = $vmm->list_all_domains();
    my %validOnes;

    # Belts and braces check: make sure the domain name is valid
    # before querying about it.
    foreach my $validDom (@validDomains) {
        my $name = $validDom->get_name();
        $validOnes{$name} = 1;
    }
    foreach my $domname ( keys %running ) {
        if ( !defined( $validOnes{$domname} ) ) {
            next;
        }
        if ( $running{$domname}->{'state'} ne 'started' ) {
            next;
        }
        my $dom = $vmm->get_domain_by_name($domname);
        if ( defined($dom) && $dom->is_active() ) {
            my @stats = $dom->get_cpu_stats( -1, 1, 0 );

            # cpu_time is in nanoseconds, fyi.
            my $cpuTime = $stats[0]->{'cpu_time'};
            if ( $cpuTime > $running{$domname}->{'cpu_time'} ) {
                $running{$domname}->{'cpu_time'} = $cpuTime;
                saveState(
                    $running{$domname}->{'state'},
                    $running{$domname}->{'reason'},
                    $domname, $cpuTime
                );
            }
        }
    }
    return;
}

#** @function logtag( )
# @brief Get the name of the tag we should use when logging to syslog
#
# @return The text tag this process should use when logging to syslog
# @see #logfilename
#*
sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

#** @function logfilename( )
# @brief Get the name of our logfile.
#
# @return The `abs_path` to the logfile we should use.
# @see #logtag
#*
sub logfilename {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    if ( uname() eq "Linux" ) {
        $name = basename($name);
        return "$basedir/log/${name}.log";
    }
    return "${name}.log";
}

#** @function savePIDFile( )
# @brief This function persists the PID file of our process to allow for
# convenient disposal of us.
#
# @return undef
# @see #removePIDFile()
#*
sub savePIDFile {
    if ( open( my $pidfile, '>', "$basedir/run/DomainMonitor.pid" ) ) {
        print $pidfile "$PID\n";
        if ( !close $pidfile ) {
            carp "Cannot close $pidfile $OS_ERROR";
        }
    }
    else {
        carp "Cannot open $pidfile $OS_ERROR";
    }
    return;
}

#** @function removePIDFile( )
# @brief This method removes our PID file from the system.
# Typically this function is called immediately prior to process exit.
#
# @return the result of unlinking our PID file.
# @see #savePIDFile()
#*
sub removePIDFile {
    return unlink("$basedir/run/DomainMonitor.pid");
}
__END__
=pod

=encoding utf8

=head1 NAME


=head1 SYNOPSIS



=head1 DESCRIPTION

=head1 OPTIONS

=over 8


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
