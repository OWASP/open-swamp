#!/usr/bin/env perl 
#** @file calldorun.pl
#
# @brief This script invokes doRun on the AgentDispatchController server.
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 09/12/2013 13:32:29
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

# Changes for CSA438
# on startup, just write out the execrunid to a folder (/opt/swamp/run for instance), then call start_process on the agent that calls doRun().
# The agent, similar to csa_agent.pl will then watch the run folder for execid files and repeatedly send them to doRun IFF the SWAMP is "ON". If SWAMP
# is ON and there are errors calling doRun, then retry and log this. If the SWAMP is OFF then just wait for it to be ON and continue.

use 5.014;
use utf8;
use warnings;
use strict;
use FindBin;
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );

use Carp qw(carp croak);
use Cwd qw(getcwd);
use English '-no_match_vars';
use Getopt::Long qw/GetOptions/;
use File::Spec qw(devnull catfile);
use File::Basename qw(basename);
use Log::Log4perl::Level;
use Log::Log4perl;
use POSIX qw(:sys_wait_h WNOHANG);    # for nonblocking read
use POSIX qw(setsid waitpid);
use Pod::Usage qw/pod2usage/;
use Storable qw(nstore lock_nstore retrieve);

use SWAMP::Client::RunControllerClient qw(configureClient doRun);
use SWAMP::Client::ExecuteRecordCollectorClient qw(configureClient updateRunStatus);
use SWAMP::Locking qw(swamplock swampunlock);
use SWAMP::SWAMPUtils qw(uname getSwampConfig getLoggingConfigString getSWAMPDir);

my $help       = 0;
my $man        = 0;
my $startupdir = getcwd;

#** @var $asdaemon If true, daemonize ourselves at launch time, else run in the foreground.
my $asdaemon = 1;
my $debug    = 0;

my $drain;
my $list;
my $execrunid;

our $VERSION = '1.00';

GetOptions(
    'help|?'       => \$help,
    'man'          => \$man,
    'runid=s'      => \$execrunid,
    'drain=i{0,1}' => \$drain,
    'list=i{0,1}'  => \$list,
    'daemon!'      => \$asdaemon,
    'debug'        => \$debug,
) or pod2usage(2);
if ($help) { pod2usage(1); }
if ($man) { pod2usage( '-verbose' => 2 ); }

if ( defined($drain) || defined($list) ) {
    $asdaemon = 0;    # Draining the queue overrides daemonizing self
}

# This script is normally invoked from within the dataserver, to prevent delays
# fork() and return immediately to the caller.
if ($asdaemon) {
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
if ($asdaemon) {
    # Turn off logging to Screen appender
    $log->remove_appender('Screen');
}

if ( defined($list) ) {
    my $aref = loadQueue();
    $log->info("Queue has $#{$aref} items in it");
    foreach my $idx ( 0 .. $#{$aref} ) {
        print "$idx $aref->[$idx]\n";
        if ( $list != 0 && $idx >= $list ) {
            last;
        }
    }
    exit 0;
}
if ( isSWAMPRunning() ) {
    my $config     = getSwampConfig();
    my $serverPort = $config->get('dispatcherPort');
    my $serverHost = $config->get('dispatcherHost');
    SWAMP::Client::RunControllerClient::configureClient( $serverHost, $serverPort );
    SWAMP::Client::ExecuteRecordCollectorClient::configureClient( $serverHost, $serverPort );

    if ( defined($drain) ) {    # Drain the queue
        drainSwamp();
    }
    else {
        if ( !callDoRun($execrunid) ) {
            # If the call failed, save the run in the queue
            saveRun($execrunid);
            updateRunStatus($execrunid, 'Unable to run, queued', 1);
        }
        else {
            updateRunStatus($execrunid, 'Enqueued');
            # Successful call to doRun() => try and drain the SWAMP.
            $drain = 0;
            drainSwamp();
        }
    }
}
else {                          # SWAMP is administratively off, just add item to queue and be done.
    if ( defined($execrunid) ) {
        saveRun($execrunid);
        updateRunStatus($execrunid, 'Unable to run, queued', 1);
    }
    if ( defined($drain) ) {
        $log->error("SWAMP is Off at the moment and cannot be drained.");
    }
}
exit 0;

sub drainSwamp {
    my $aref = loadQueue();
    $log->info("Queue has $#{$aref} items in it");
    foreach my $idx ( 0 .. $#{$aref} ) {
        if ( !defined( $aref->[$idx] ) ) {
            next;
        }

        # If the call succeeded, delete the
        # item from the queue
        if ( callDoRun( $aref->[$idx] ) ) {
            $aref->[$idx] = 'done';
        }
        if ( $drain != 0 && $idx >= $drain ) {
            last;
        }
    }
    my @list;
    foreach my $idx ( 0 .. $#{$aref} ) {
        if ( defined( $aref->[$idx] ) && $aref->[$idx] ne 'done' ) {
            push @list, $aref->[$idx];
        }
    }
    saveQueue( \@list );
    return;
}

sub saveRun {
    my $erunid = shift;
    $log->info("Adding $erunid to the queue");
    my $aref = loadQueue();
    push @{$aref}, $erunid;
    saveQueue($aref);
    return;
}

sub callDoRun {
    my $erunid = shift;
    my $ret    = 1;
    my $result = doRun($erunid);
    if ( defined( $result->{'error'} ) ) {
        $log->error("Unable to call doRun with $erunid $result->{'error'}");
        $ret = 0;
    }

    return $ret;
}

sub isSWAMPRunning {
    my $config = getSwampConfig();
    my $ret    = 0;
    if ( $config->exists('SWAMPState') ) {
        $ret = ( $config->get('SWAMPState') =~ /ON/sxmi );
    }
    return $ret;
}

sub queueFilename {
    return File::Spec->catfile( getSWAMPDir(), 'log', 'runqueue' );
}

#** @function loadQueue( )
# @brief Read in the current list of queued aruns, emptying the queue before releasing the advisory lock. 
# Emptying the queue prevents multiple processes from reading the queue and acting on the 
# contents multiple times. [CSA-1374]
#
# @return a reference to an array of execrunids
# @see 
#*
sub loadQueue {
    my $filename = queueFilename();
    my $ret      = ();
    if ( swamplock($filename) ) {
        $ret = retrieve($filename);
        nstore( \my @arr, $filename );
        swampunlock($filename);
    }
    return $ret;
}

sub saveQueue {
    my $aref = shift;
    lock_nstore( $aref, queueFilename() );
    return;
}

sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

sub logfilename {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    if ( uname() eq "Linux" ) {
        $name = basename($name);
        return "/opt/swamp/log/${name}.log";
    }
    return "${name}.log";
}

__END__
=pod

=encoding utf8

=head1 NAME

calldorun.pl - invoke doRun method on AgentDispatcher

=head1 SYNOPSIS

calldorun.pl [--drain] [--runid execrunid]

=head1 DESCRIPTION

This script is invoked from within the Run Request database and is provided a single argument: the UUID of an execution record. This parameter is passed to the doRun method of the AgentDispatcher. The script immediately forks itself upon launching and the parent returns to the caller while the child makes the call unless the --drain option is used. 

=head1 OPTIONS

=over 8

=item --runid execrunid 

the string passed on the command line is expected to be an execute run id to be passed to the Dispatcher's doRun method.

=item --drain 

If specified, the queue of jobs waiting to be launched will be sent to the Dispatcher's doRun method.


=item --help

Show help for this script

=item --man

Show manual page for this script

=back

=cut


