#** @file AgentClient.pm
#
# @brief This file contains the client interface to the AgentMonitor
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

package SWAMP::Client::AgentClient;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use SWAMP::Client::LogCollectorClient qw(logStatus logLog);

use RPC::XML;
use RPC::XML::Client;
use Log::Log4perl;
use SWAMP::RPCUtils qw(rpccall okReturn);
use SWAMP::SWAMPUtils qw(getMethodName);

#** @class SWAMP::Client::AgentClient
# This package contains the client interface to the AgentMonitor. Perl clients wishing to communicate with the Agent Monitor
# should use this package's functions.
#*
BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;

    #      agentGetNumberJobs
    #      agentGetDomainState
    @EXPORT_OK = qw(
      abortViewer
      addVmID
      agentLogLog
      agentLogState
      clusterJobStatus
      configureClient
      createVmID
      csaAgentFinished
      csaAgentStop
      execNodePing
      getSuitableMachines
      fetchHistoryFile
      fetchRawResults
      isViewerAvailable
      launchViewer
      listJobs
      listVmID
      okToLaunch
      queryVmID
      removeVmID
      resultsProcessed
      serverVersion
      setLoggingLevel
      setViewerState
      storeviewer
      status
      updateAssessmentStatus
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

my $uri = 'http://localhost:8082';
my $client;

#** @method configureClient ($state)
# This method will change and keep track of the various states that the state machine
# transitions to and from. Having this information allows you to return to a previous
# state. If you pass nothing in to this method it will restore the previous state.
# @param state - optional string (state to change to)
#*
sub configureClient {
    my $host = shift;
    my $port = shift;
    $uri = "http://$host:$port";
    undef $client;
    logDebug("AgentClient::configureClient: $uri");
    return;
}

sub getClient {
    if ( !defined($client) ) {
        $client = RPC::XML::Client->new($uri);
    }
    return $client;
}

## PerlCritic cannot properly handle packages with multiple
# classes such as RPC::XML.pm.
## no critic (RequireExplicitInclusion)

#** @function agentLogState( $timestamp, $domainname, $state, $reason)
# @brief Log the state of a VM to the log collector
#
# @param timestamp the time of the event in seconds since the epoch
# @param domainname the domain to which this event applies
# @param state textual representation of the domain's state
# @param reason the textual reason the domain transitioned to $state
# @return
# @see {@link main::_agentLogState} in AgentMonitor.pl
#*
sub agentLogState {
    my $timestamp  = shift;
    my $domainname = shift;
    my $state      = shift;
    my $reason     = shift;

    my $req = RPC::XML::request->new(
        getMethodName('AGENT_MONITOR_LOGSTATE'),
        RPC::XML::struct->new(
            'timestamp' => $timestamp,
            'execrunid' => $domainname,
            'state'     => $state,
            'reason'    => $reason
        )
    );
    return rpccall( getClient(), $req );
}

sub serverVersion {
    my $resp = getClient()->send_request('server.version');
    if ( ref($resp) ) {
        return $resp->value;
    }
    return;
}

#sub agentGetDomainState {
#    my $vmid = shift;
#    my $req =
#      RPC::XML::request->new( getMethodName('AGENT_MONITOR_DOMAINSTATE'),
#        RPC::XML::string->new($vmid) );
#    return rpccall( getClient(), $req );
#}

sub agentLogLog {
    my $vmid     = shift;
    my $pathname = shift;
    my $checksum = shift;
    return logLog( $vmid, $pathname, $checksum, $uri, getMethodName('AGENT_MONITOR_LOGLOG') );
}

sub createVmID {
    my $req = RPC::XML::request->new( getMethodName('AGENT_MONITOR_CREATEVMID') );
    my $res = getClient()->send_request($req);
    my $ret;
    if ( ref $res ) {
        $ret = $res->value;
    }
    return $ret;

    #    return rpccall( getClient(), $req);
}

#** @function removeVmID( $vmidref )
# @brief Remove a VMID from the system.
#
# @param vmidref Reference to a scalar VM ID
# @return 1 if successful, 0 otherwise. If successful, `vmidref` is undefined to prevent further use.
#*
sub removeVmID {
    my $vmidref = shift;
    my $req     = RPC::XML::request->new( getMethodName('AGENT_MONITOR_REMOVEVMID'),
        RPC::XML::string->new( ${$vmidref} ) );
    my $res = getClient()->send_request($req);
    my $ret = -1;
    if ( ref $res ) {
        $ret = $res->value;
        if ( $ret == 1 ) {
            undef ${$vmidref};
        }
    }
    return $ret;
}

sub listVmID {
    my $req = RPC::XML::request->new( getMethodName('AGENT_MONITOR_LISTVMID') );
    my $res = getClient()->send_request($req);
    if ( ref $res ) {
        return $res->value;
    }
    return;
}

sub queryVmID {
    my $vmid = shift;
    my $req  = RPC::XML::request->new( getMethodName('AGENT_MONITOR_QUERYVMID'),
        RPC::XML::string->new($vmid) );
    return rpccall( getClient(), $req );
}

sub addVmID {
    my $vmid      = shift;
    my $execrunid = shift;
    my $domain    = shift;
    my $req       = RPC::XML::request->new(
        getMethodName('AGENT_MONITOR_ADDVMID'), RPC::XML::string->new($vmid),
        RPC::XML::string->new($execrunid),      RPC::XML::string->new($domain)
    );
    return rpccall( getClient(), $req );
}

sub okToLaunch {
    my $execrunid = shift;
    my $req       = RPC::XML::request->new( getMethodName('CSAAGENT_OKTOLAUNCH'),
        RPC::XML::string->new($execrunid) );
    logDebug("AgentClient::okToLaunch on $uri for $execrunid");

    return rpccall( getClient(), $req );
}

sub listJobs {
    my $req = RPC::XML::request->new( getMethodName('AGENT_MONITOR_LISTJOBS') );
    logDebug("AgentClient::listJobs on $uri called");
    return rpccall( getClient(), $req );
}

#sub agentGetNumberJobs {
#    my $ipaddress = shift;
#    my $req       = RPC::XML::request->new(
#        getMethodName('AGENT_MONITOR_JOBCOUNTBYIP'),
#        RPC::XML::string->new($ipaddress)
#    );
#    return rpccall( getClient(), $req );
#}

#** @method clusterJobStatus($timestamp, \%mapref )
# @brief Send a map of {execrunid => HTCondor event status) to agentMonitor
#
# @param timestamp
# @param mapref reference to a hashmap of execrunid by condor event statuses
# @return rpccall
#*
sub clusterJobStatus {
    my $timestamp = shift;
    my $mapref    = shift;
    my $req       = RPC::XML::request->new(
        getMethodName('AGENT_MONITOR_JOBSTATUS'),
        RPC::XML::string->new($timestamp),
        RPC::XML::struct->new($mapref)
    );
    return rpccall( getClient(), $req );
}

# Similar to updateExecutionResults, but for the event log
sub updateAssessmentStatus {
    my $execrunid = shift;
    my $status    = shift;
    my $req       = RPC::XML::request->new(
        'agentMonitor.updateAssessmentStatus',
        RPC::XML::string->new($execrunid),
        RPC::XML::string->new($status)
    );
    return rpccall( getClient(), $req );
}

sub resultsProcessed {
    my $execrunid = shift;
    my $status    = shift;
    my $req       = RPC::XML::request->new(
        'agentMonitor.resultsProcessed',
        RPC::XML::string->new($execrunid),
        RPC::XML::string->new($status)
    );
    return rpccall( getClient(), $req );
}

sub csaAgentFinished {
    my $mapref    = shift;
    my $execrunid = $mapref->{'execrunid'};
    my $req =
      RPC::XML::request->new( getMethodName('CSAAGENT_FINISHED'), RPC::XML::struct->new($mapref) );
    logDebug("AgentClient::csaAgentFinished on $uri execid is $execrunid");
    return rpccall( getClient(), $req );
}

sub csaAgentStop {
    my $mapref    = shift;
    my $execrunid = $mapref->{'execrunid'};
    my $req =
      RPC::XML::request->new( getMethodName('CSAAGENT_STOP'), RPC::XML::struct->new($mapref) );
    logDebug("AgentClient::csaAgentStop on $uri execid is $execrunid");
    return rpccall( getClient(), $req );
}

#** @function getSuitableMachines( )
# @brief Return a list of machines on which we can run HTCondor jobs
#
# @return List of machine names (not IP addresses) that can be used for HTCondor jobs.
#*
sub getSuitableMachines {
    my $mode = shift // 'normal';
    my $req = RPC::XML::request->new( getMethodName('CSAAGENT_GETMACHINELIST'), RPC::XML::string->new($mode) );
    logDebug("AgentClient::getSuitableMachines on $uri");

    return rpccall( getClient(), $req );
}

sub setLoggingLevel {
    my $level = shift;
    my $req = RPC::XML::request->new( 'agentMonitor.setLogLevel', RPC::XML::string->new($level) );
    return rpccall( getClient(), $req );

}

sub fetchHistoryFile {
    my $req = RPC::XML::request->new('agentMonitor.fetchHistoryFile');
    return rpccall( getClient(), $req );
}

sub fetchRawResults {
    my $execrunid = shift;
    my $req =
      RPC::XML::request->new( 'agentMonitor.fetchRawResults', RPC::XML::string->new($execrunid) );
    logDebug("fetchRawResults requested for $execrunid");
    return rpccall( getClient(), $req );
}

sub status {
    my $req = RPC::XML::request->new('agentMonitor.status');
    logDebug("status called");
    return rpccall( getClient(), $req );
}

sub execNodePing {
    my $ip        = shift;
    my $viability = shift;
    my $nCPU      = shift;
    my $memGB     = shift;
    my $req       = RPC::XML::request->new(
        'agentMonitor.execNodePing',       RPC::XML::string->new($ip),
        RPC::XML::string->new($viability), RPC::XML::string->new($nCPU),
        RPC::XML::string->new($memGB)
    );
    logDebug("execNodePing on $uri called $ip $viability $nCPU $memGB");
    return rpccall( getClient(), $req );

}

sub setViewerState {
    my %options = (
        'viewer' => 'CodeDX',
        @_);
    my $req     = RPC::XML::request->new(
        'agentMonitor.setViewerState',
        RPC::XML::struct->new( \%options),
    );
    return rpccall( getClient(), $req );

}
sub storeviewer {
    my %options = (@_);
    my $req     = RPC::XML::request->new(
        'agentMonitor.storeviewer',
        RPC::XML::struct->new(\%options)
    );
    return rpccall( getClient(), $req );
}
sub abortViewer {
    my %options = (@_);
    my $req     = RPC::XML::request->new(
        'agentMonitor.abortViewer',
        RPC::XML::struct->new(\%options)
    );
    return rpccall( getClient(), $req );
}
sub launchViewer {
    my %options = (@_);
    my $req     = RPC::XML::request->new(
        'agentMonitor.launchViewer',
        RPC::XML::struct->new(\%options)
    );
    return rpccall( getClient(), $req );
}
sub isViewerAvailable {
    my %options = (
        'viewer' => 'CodeDX',
        @_);

    my $req     = RPC::XML::request->new(
        'agentMonitor.isViewerAvailable',
        RPC::XML::string->new( $options{'viewer'} ),
        RPC::XML::string->new( $options{'project'} ),
    );
    logDebug("isViewerAvailable on $uri called $options{'viewer'} $options{'project'}");
    return rpccall( getClient(), $req );
}

sub logDebug {
    if ( Log::Log4perl->initialized() ) {
        my $msg = shift;
        Log::Log4perl->get_logger(q{})->debug($msg);
    }
    return;
}
1;

__END__
=pod

=encoding utf8

=head1 NAME

AgentClient - methods for creation and manipulating VMs 

=head1 SYNOPSIS

ToDO: write synopsis

=head1 DESCRIPTION

ToDO: write description

=head1 OPTIONS

=over 8

=item 


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
