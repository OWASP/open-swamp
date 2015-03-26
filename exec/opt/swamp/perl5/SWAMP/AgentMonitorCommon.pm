#** @file AgentMonitorCommon.pm
#
# @brief
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 08/19/13 12:52:21
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::AgentMonitorCommon;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

use Cwd qw(abs_path);
use Log::Log4perl;
use Time::HiRes qw(gettimeofday);
use SWAMP::Client::GatorClient qw( insertSystemStatus insertExecEvent );
use SWAMP::Floodlight qw(deleteFlows);
#use vars qw($TEST_MODE);

BEGIN {
    our $VERSION = '1.00';
    our $TEST_MODE = 0;
}
our ( @EXPORT_OK, %EXPORT_TAGS );

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
    $TEST_MODE
      addJob
      buildSuitableMachineList
      cleanupDomain
      clearViewerCount
      deleteVMID
      eventLog
      getCurrentStatus
      getClusterHypervisor
      getClusterID
      getClusterStatus
      getDomainState
      getDomainID
      getDomainMap
      getExecuteID
      getExecrunIDs
      getHypervisorList
      getVMIDfromDomain
      getViewerByDomain
      getViewerCount
      getViewerState
      getViewerAddress
      getViewerapikey
      getViewerURLuuid
      getViewerUUID
      grabLaunchToken
      incViewerCount
      initAppState
      isClusterID
      isValidVMID
      jobFinished
      jobLaunched
      numberJobs
      numberJobsLaunched
      releaseLaunchToken
      removeJob
      removeClusterID
      restoreAppState
      restoreHypervisorState
      saveAppState
      setDomainState
      setHypervisorViability
      setViabilityFrequency
      setClusterHypervisor
      setClusterInfo
      setsystemstatus
      saveViewerState
      setVMID
    );
    %EXPORT_TAGS = ( 'common' => [@EXPORT_OK] );
}

use English '-no_match_vars';
use Carp qw(croak carp);
use Storable qw(nstore_fd lock_nstore lock_retrieve fd_retrieve);
use SWAMP::SWAMPUtils qw(getHostname);

my $launchToken_alpha;
my $launchToken_beta;
my $jobsLaunched    = 0;
my $persistencefile = '.agentstate';

# Sea change: .agenthistory is a perl object, .agentevents is an ascii file
my $historyfile    = '.agentevents';
my $hypervisorfile = '.hypervisors';
my $viewerfile = '.viewerinfo';

#** @var %nodeLoad this is a map containing the number of VMs (jobs) running on each host (hypervisor)
# indexed by host.
my %nodeLoad;

#** @var %domainMap this is a map of domains indexed by vmid.
my %domainMap;

#** @var %agentMap This is a map of cluster ID and status indexed by EXECUTE RUN-UID
my %agentMap;

#** @var %history This is a map of executeid history indexed by EXECUTE RUN-UID
## my %history;

#** @var $hypervisors Reference to a map of hypervisors indexed by hypervisor IP address.
my $hypervisors;

#** @var $viewers reference to map of VRUN viewers indexed by viewername & project.
my $_viewers;

#sub byload {
#    return numberJobs($a) <=> numberJobs($b);
#}
#
{
    my $freq = 300;

    sub setViabilityFrequency {
        $freq = shift;
        return;
    }

    sub getViabilityFrequency {
        return $freq;
    }
}
##* @function getHypervisorList( )
#  @brief Get the list of viable hypervisors on which assessments can be run.
# @return A list of hypervisors that can be used by this SWAMP instance
#*
sub getHypervisorList {
    my $now = time;
    $now -= getViabilityFrequency();
    my @nodes;
    foreach my $node ( keys %{$hypervisors} ) {

        # If the node is alive and has checked in in the last 5 mins, keep it.
        if ( $hypervisors->{$node}->{'viability'} eq SWAMP::SWAMPUtils->ALIVE
            && ( $now < $hypervisors->{$node}->{'time'} ) )
        {
            push @nodes, $node;
        }
        elsif ( $hypervisors->{$node}->{'viability'} eq SWAMP::SWAMPUtils->ALIVE
            && ( $now >= $hypervisors->{$node}->{'time'} ) )
        {
            # If this node has claimed to be alive but hasn't checked in in a while,
            # mark it as absent
            setHypervisorViability( $node, SWAMP::SWAMPUtils->AWOL );
        }
    }
    return @nodes;
}

sub setHypervisorViability {
    my $execIP    = shift;
    my $viability = shift;
    my $ncpu = shift;
    my $nGB = shift;
    if ( defined( $hypervisors->{$execIP} ) ) {
        if ( $hypervisors->{$execIP}->{'viability'} ne $viability ) {
            Log::Log4perl->get_logger(q{})->info("execNodePing: $execIP : $viability");
        }
    }
    $hypervisors->{$execIP}->{'viability'} = $viability;

    _updateSystemStatus();
    # Do not update these fields if the client does not set them
    if (defined($ncpu)) {
        my $currVal = $hypervisors->{$execIP}{'ncpu'};
        my $oldVal = defined($currVal) ? $currVal : 0;
        $hypervisors->{$execIP}->{'ncpu'}      = $ncpu;
    }
    if (defined($nGB)) {
        my $currVal = $hypervisors->{$execIP}{'nGB'};
        my $oldVal = defined($currVal) ? $currVal : 0;
        $hypervisors->{$execIP}->{'nGB'}      = $nGB;
    }
    $hypervisors->{$execIP}->{'time'}      = time;
    saveHypervisorState();
    return;
}
sub _updateSystemStatus {
    state $lastSave=0;
    if ( time - $lastSave > 60 ) { # Has it been 1 minute?
        my @iplist = keys %{$hypervisors};
        setsystemstatus( q{hypervisor_ips}, join( q{,}, @iplist ) );
        setsystemstatus( q{hypervisors}, 1 + $#iplist );
        foreach my $node (@iplist) {
            setsystemstatus( qq{${node}_status}, $hypervisors->{$node}->{'viability'} );
            setsystemstatus( qq{${node}_hostname}, getHostname($node) );
        }
        $lastSave = time;
    }
    return;
}
sub numberGB {
    my $execIP = shift;
    my $ret = 4;
    if (defined($hypervisors->{$execIP}->{'nGB'}) ) {
        $ret = $hypervisors->{$execIP}->{'nGB'};
    }
    return $ret;
}
sub numberCPU {
    my $execIP = shift;
    my $ret = 4;
    if (defined($hypervisors->{$execIP}->{'ncpu'}) ) {
        $ret = $hypervisors->{$execIP}->{'ncpu'};
    }
    return $ret;
}

#** @function buildSuitableMachineList(\@machineList )
# @brief Given a list of machines, return a subset of the list containing the
# machines on which jobs can be submitted.
#
# @param  machineList list of machine from which to create the list
# @return list of machines from machineList that can be used. empty is fine too.
# @see
#*
sub buildSuitableMachineList {
    my $listref = shift;
    my @machines;

    foreach my $machine ( @{$listref} ) {
            push @machines, $machine;
    }
    return @machines;
}

sub setsystemstatus {
    if ($SWAMP::AgentMonitorCommon::TEST_MODE) {
        return;
    }
    my $key = shift;
    my $value = shift;
    return insertSystemStatus({ 'statuskey' => $key, 'statusvalue' => $value});
}
sub eventLog {
    if ($SWAMP::AgentMonitorCommon::TEST_MODE) {
        return;
    }
    my $execrunid = shift;
    my $event     = shift;
    my $payload   = shift // qq{};
    my ( $sec, $microsec ) = gettimeofday();
    insertExecEvent( { 'execrecorduuid' => $execrunid, 
        'eventtime' => "$sec.$microsec", 
        'eventname' => $event, 
        'eventpayload' => $payload });
#
#    $history{$execrunid}->{"$sec.$microsec"}->{$event} = $payload;
    ##if ( open( my $fh, '>>', $historyfile ) ) {
     ##   print $fh "$execrunid,$sec.$microsec,$event, $payload\n";
      ##  if ( !close($fh) ) {
       ##     Log::Log4perl->get_logger(q{})->warn("Error closing event log file $OS_ERROR");
        ##}
    ##}
    ##else {
      ##  Log::Log4perl->get_logger(q{})->warn("Unable to open event log file $OS_ERROR");
    ##}
    return;
}

#** @function addJob( $host )
# @brief Add a job to the load of a hypervisor.
#
# @param host The hypervisor on which a new job has been loaded.
# @return current load on the $host
#*
sub addJob {
    my $host = shift;

#    if ( !defined( $nodeLoad{$host} ) ) {
#        $nodeLoad{$host} = 0;
#    }
    $nodeLoad{$host}++;
    Log::Log4perl->get_logger(q{})->debug("Increasing load for $host $nodeLoad{$host}");
    return $nodeLoad{$host};
}

#** @function numberJobs( $host )
# @brief Return the number of jobs currently running on a hypervisor
#
# @param host the hypervisor which to check (IP ADDRESS, not hostname)
# @return Number of jobs running on the hypervisor.
#*
sub numberJobs {
    my $host = shift;
    if ( defined( $nodeLoad{$host} ) ) {
        return $nodeLoad{$host};
    }
    else {
        return 0;
    }
}

#** @function removeJob( $host )
# @brief Decrease the load of a hypervisor
#
# @param host The host on which a job has completed
# @return current load on $host
#*
sub removeJob {
    my $host = shift;

    if ( !defined($host) || $host eq 'UNKNOWN' ) {
        return 0;
    }
    if ( defined( $nodeLoad{$host} ) ) {
        $nodeLoad{$host}--;
        if ( $nodeLoad{$host} < 0 ) {
            $nodeLoad{$host} = 0;    # Don't be ridiculous
        }
        Log::Log4perl->get_logger(q{})->debug("Decreasing load for $host $nodeLoad{$host}");
    }
    else {
        Log::Log4perl->get_logger(q{})->warn("Node load for $host not defined.");
    }
    return $nodeLoad{$host};
}

sub restoreHypervisorState {
    if ( -r $hypervisorfile ) {
        $hypervisors = lock_retrieve($hypervisorfile);
    }
    return;
}

sub saveHypervisorState {
    lock_nstore( $hypervisors, abs_path($hypervisorfile) );
    return;
}
sub _persistViewerState {
    lock_nstore( $_viewers, abs_path($viewerfile) );
    return;
}
sub _restoreViewerState {
    if ( -r $viewerfile ) {
        $_viewers = lock_retrieve($viewerfile);
        my $anyValid = 0;
        foreach my $viewer (keys %{$_viewers}) {
            foreach my $project (keys %{$_viewers->{$viewer}}) {
                my $state = $_viewers->{$viewer}{$project}->{'state'};
                if (defined($state) && $state eq 'ready') {
                    $anyValid = 1;
                    last;
                }
            }
        }
        if (!$anyValid) {
            unlink ($viewerfile);
        }
    }
    return;
}

#sub saveHistory {
#    lock_nstore( \%history, abs_path($historyfile) );
#    return;
#}

sub saveAppState {
    if ( open( my $fd, '>', abs_path($persistencefile) ) ) {
        nstore_fd \%domainMap, \*{$fd};
        nstore_fd \%agentMap,  \*{$fd};
        if ( !close($fd) ) {
            Log::Log4perl->get_logger(q{})
              ->warn("saveAppState: Unable to close persistence file $persistencefile: $OS_ERROR");
        }
    }
    else {
        Log::Log4perl->get_logger(q{})
          ->warn("saveAppState: Unable to write persistence file $persistencefile: $OS_ERROR");
    }
    return;
}

sub initAppState {
    unlink $persistencefile;
    restoreHistory();
    unlink $viewerfile;
    return;
}

# If the old history file exists, convert it to new format and proceed.
sub restoreHistory {
    if ( -r '.agenthistory' ) {
        my $histref = lock_retrieve('.agenthistory');
        if ( open( my $fh, '>', $historyfile ) ) {
            foreach my $key ( keys %{$histref} ) {
                foreach my $ts ( keys %{ $histref->{$key} } ) {
                    foreach my $event ( keys %{ $histref->{$key}->{$ts} } ) {
                        print $fh "$key,$ts,$event, $histref->{$key}->{$ts}->{$event}\n";
                    }
                }
            }
            if (!close($fh)) {
                Log::Log4perl->get_logger(q{})
                  ->warn("Unable to close history file $OS_ERROR");
            }
            else {
                # Now we can remove this old file.
                unlink '.agenthistory';
            }
        }
        else {
            Log::Log4perl->get_logger(q{})
              ->warn("Unable to open history file for restore $OS_ERROR");
        }
    }
    return;
}

sub restoreAppState {
    restoreHistory();    # Restore history first!
    if ( -r $persistencefile ) {
        if ( open( my $fd, '<', abs_path($persistencefile) ) ) {
            my $idref = fd_retrieve( \*{$fd} );
            my $agref = fd_retrieve( \*{$fd} );
            if ( !close($fd) ) {

                Log::Log4perl->get_logger(q{})
                  ->warn(
                    "restoreAppState: Unable to close persistence file $persistencefile: $OS_ERROR"
                  );
            }
            undef %domainMap;
            undef %agentMap;

            foreach my $key ( keys %{$idref} ) {
                setVMID( $key, $idref->{$key}->{'execrunid'}, $idref->{$key}->{'domain'} );
            }
            foreach my $key ( keys %{$agref} ) {
                setClusterInfo( $key, $agref->{$key}->{'id'}, $agref->{$key}->{'status'} );
            }
        }
        else {
            Log::Log4perl->get_logger(q{})
              ->warn("restoreAppState:Unable to open persistence file $persistencefile: $OS_ERROR");
        }
    }
    _restoreViewerState();
    return;
}

#** @function deleteVMID( $vmid )
# @brief remove a vmID from both domain map
#
# @param vmid The vmID to be forgotten
# @return 1 if the vmID was removed, 0 otherwise
#*
sub deleteVMID {
    my $vmid = shift;
    if ( isValidVMID($vmid) ) {
        delete $domainMap{$vmid};
        return 1;
    }
    return 0;
}

#sub getHistory {
#    my $id     = shift;
#    my $sref   = shift;
#    my $nFound = 0;
#    my @match  = grep { /^$id/sxm } keys %history;
#    if ( $#match == 0 ) {
#        $id = $match[0];
#        foreach my $key ( keys %{ $history{$id} } ) {
#            $sref->{$key} = $history{$id}->{$key};
#        }
#    }
#    return;
#}

sub getCurrentStatus {
    my $sref = shift;
    foreach my $host ( keys %nodeLoad ) {
        $sref->{'load'}->{$host} = $nodeLoad{$host};
    }
    foreach my $eid ( keys %agentMap ) {
        $sref->{'cluster'}->{$eid}->{'hypervisor'} = getClusterHypervisor($eid);
        $sref->{'cluster'}->{$eid}->{'id'}         = getClusterID($eid);
        $sref->{'cluster'}->{$eid}->{'status'}     = getClusterStatus($eid);
        my $vmid = getVMIDfromExecrunID($eid);
        if ( defined($vmid) ) {
            $sref->{'cluster'}->{$eid}->{'domainstate'} = getDomainState($vmid);
            $sref->{'cluster'}->{$eid}->{'domain'}      = getDomainID($vmid);
        }
    }
    return;
}

#** @function getDomainID( $vmid )
# @brief Return the domain id associated with a vmID
#
# @param vmid The vmID used for the query
# @return the domain ID associated with the vmID or undef
# @see getExecuteID
#*
sub getDomainID {
    my $vmid = shift;
    if ( isValidVMID($vmid) ) {
        return $domainMap{$vmid}->{'domain'};
    }
    else {
        return;
    }
}

#** @function getVMIDfromExecrunID( $execrunid)
# @brief Reverse lookup a vmid from an execrunid.
#
# @param execrunid the execrunid from which to derive a VMID
# @return the vmid associated with the execrunid
#*
sub getVMIDfromExecrunID {
    my $execrunid = shift;
    foreach my $vmid ( keys %domainMap ) {
        if ( $domainMap{$vmid}->{'execrunid'} eq $execrunid ) {
            return $vmid;
        }
    }
    return;
}

#** @function getVMIDfromDomain( $domain)
# @brief Reverse lookup a vmid from a domain.
#
# @param domain the domain name from which to derive a VMID
# @return the vmid of the $domain.
#*
sub getVMIDfromDomain {
    my $domain = shift;
    foreach my $vmid ( keys %domainMap ) {
        if ( $domainMap{$vmid}->{'domain'} eq $domain ) {
            return $vmid;
        }
    }
    return;
}

#** @function setDomainState( $vmid, $state)
# @brief Record the current state of the domain associated with vmid
#
# @param vmid The id of the domain
# @param state The current state to which the domain has transitioned
# one of { "defined", "resumed", "started", "stopped", "shutdown", "suspended",
#        "undefined", "pmsuspended" }
# @return 1 if the vmid refers to a valid domain, 0 otherwise
# @see Sys::Virt::Event
#*
sub setDomainState {
    my $vmid  = shift;
    my $state = shift;
    if ( isValidVMID($vmid) ) {
        $domainMap{$vmid}->{'domainstate'} = $state;
        eventLog( getExecuteID($vmid), 'domainstate', $state );
        return 1;
    }
    return 0;
}

sub getDomainState {
    my $vmid = shift;
    if ( isValidVMID($vmid) ) {
        return $domainMap{$vmid}->{'domainstate'};
    }
    return 'INVALID_DOMAIN';
}

#** @function getExecuteID( $vmid )
# @brief return the execute run id associated with a vmID
#
# @param vmid The vmID used for the query
# @return the execute run id associated with the vmID or undef
# @see getDomainID
#*
sub getExecuteID {
    my $vmid = shift;
    if ( isValidVMID($vmid) ) {
        return $domainMap{$vmid}->{'execrunid'};
    }
    return;
}

#** @function setClusterHypervisor($execrunid, $host )
# @brief Once a cluster job has transitioned to state 1, Execute, it knows the host
# it is running on. Track this information so that we do not overcommit our hypervisors.
#
# @param execrunid The execrunid associated with the cluster job
# @param host The host on which the job is running.
# @return undef
#*
sub setClusterHypervisor {
    my $execrunid = shift;
    my $host      = shift;
    Log::Log4perl->get_logger(q{})
      ->debug("setClusterHypervisor $execrunid = $host [$agentMap{$execrunid}->{'hypervisor'}]");
    if ( $host ne $agentMap{$execrunid}->{'hypervisor'} ) {

        # This handles the case where the job might migrate.
        removeJob( $agentMap{$execrunid}->{'hypervisor'} );

        addJob($host);
    }
    $agentMap{$execrunid}->{'hypervisor'} = $host;
    eventLog( $execrunid, 'sethypervisor', $host );

    # Also release the token so another job can start.
    releaseLaunchToken($execrunid);
    return;
}

#** @function getClusterHypervisor( $execrunid)
# @brief Get the name of the hypervisor on which the job $execrunid is executing
#
# @param execrunid The execrun id of the job in question
# @return  The name of the host on which the job is running.
#*
sub getClusterHypervisor {
    my $execrunid = shift;
    if ( isClusterID($execrunid) ) {
        return $agentMap{$execrunid}->{'hypervisor'};
    }
    else {
        return;
    }
}

#** @function getClusterID( $execrunid )
# @brief getter for Agent associations
#
# @param execrunid The execute run ID of interest
# @return the cluster job ID associated with execrunid or undef
#*
sub getClusterID {
    my $execrunid = shift;
    if ( isClusterID($execrunid) ) {
        return $agentMap{$execrunid}->{'id'};
    }
    else {
        return;
    }
}

sub getExecrunIDs {
    return keys %agentMap;
}

#** @function getClusterStatus( $execrunid )
# @brief getter for Agent associations
#
# @param execrunid The execute run ID of interest
# @return the current cluster job status associated with execrunid or undef
#*
sub getClusterStatus {
    my $execrunid = shift;
    return $agentMap{$execrunid}->{'status'};
}

sub getDomainMap {
    return \%domainMap;
}

#** @function isClusterID( $execrunid )
# @brief Determine if the execrunid is associated with a job ID
#
# @param execrunid  The execute run ID of interest
# @return 1 if the execrunid has been associated with a job, 0 otherwise
# @see
#*
sub isClusterID {
    my $execrunid = shift;
    if ( defined( $agentMap{$execrunid} ) ) {
        return 1;
    }
    return 0;
}

#** @function isValidVMID( $vmid )
# @brief returns 1 if the provided vmID is associated with a domain
#
# @param vmid The vmID to be checked
# @return 1 if the vmID is associated with a domain
#*
sub isValidVMID {
    my $vmid = shift;
    if ( defined( $domainMap{$vmid} ) ) {
        return 1;
    }
    return 0;
}

#** @function removeClusterID( $execrunid)
# @brief disassociate an execute run id with it's job id
#
# @param execrunid The execution run ID to disassociate
# @return 1 if the execrunid was valid (defined), 0 otherwise
#*
sub removeClusterID {
    my $execrunid = shift;
    Log::Log4perl->get_logger(q{})
      ->debug("removeClusterID $execrunid <$agentMap{$execrunid}->{'hypervisor'}>");
    if ( defined( $agentMap{$execrunid} ) ) {
        $jobsLaunched--;
        eventLog( $execrunid, 'removeclusterid' );
        removeJob( $agentMap{$execrunid}->{'hypervisor'} );
        delete $agentMap{$execrunid};
        return 1;
    }
    return 0;
}

#** @function setClusterInfo( $execrunid, $clusterid, $status)
# @brief update association of $clusterid with $execrunid
#
# @param execrunid the execution run ID to associate with this job (cluster) id
# @param clusterid the job ID
# @param status current HTCondor status of the job ID
# @return 1 if successful, 0 if the execrunid is already associated with a job id.
#*
sub setClusterInfo {
    my $execrunid = shift;
    my $clusterid = shift;
    my $status    = shift;
    $agentMap{$execrunid}->{'id'}     = $clusterid;
    $agentMap{$execrunid}->{'status'} = $status;
    eventLog( $execrunid, 'htcondorstatus', $status );
    if ( !defined( $agentMap{$execrunid}->{'hypervisor'} ) ) {
        $agentMap{$execrunid}->{'hypervisor'} = 'UNKNOWN';
        $agentMap{$execrunid}->{'starttime'}  = time;
    }
    return 1;
}

#** @function setVMID( $vmid , $execrunid, $domain)
# @brief associate $vmid with domain and execute run ID
#
# @param vmid the VM ID to associate with the domain and execute ID
# @param execrunid the execute run id to associate with $vmid
# @param domain the domain to associate with $vmid
# @return 1 if the association succeeded, 0 if the id is already associated
#*
sub setVMID {
    my $vmid      = shift;
    my $execrunid = shift;
    my $domain    = shift;
    if ( !isValidVMID($vmid) ) {
        $domainMap{$vmid}->{'domain'}      = $domain;
        $domainMap{$vmid}->{'execrunid'}   = $execrunid;
        $domainMap{$vmid}->{'domainstate'} = 'UNKNOWN';
        eventLog( $execrunid, 'setvmid', $domain );
        return 1;
    }
    return 0;
}

sub jobFinished {
    $jobsLaunched--;
    if ( $jobsLaunched < 0 ) {
        $jobsLaunched = 0;
    }
    return $jobsLaunched;
}

sub numberJobsLaunched {
    return $jobsLaunched;
}

sub jobLaunched {
    $jobsLaunched++;
    return $jobsLaunched;
}

sub grabLaunchToken {
    my $execrunid = shift;
    if ( !defined($launchToken_alpha) ) {
        $launchToken_alpha = $execrunid;
        return 1;    # got it.
    }

    # Try the second one
    if ( !defined($launchToken_beta) ) {
        $launchToken_beta = $execrunid;
        return 1;    # got it.
    }
    return 0;        # did not grab
}

sub releaseLaunchToken {
    my $execrunid = shift;

    # Also release the token so another job can start.
    if ( defined($launchToken_alpha) && $launchToken_alpha eq $execrunid ) {
        undef $launchToken_alpha;
        return 1;
    }

    # Try the second one
    if ( defined($launchToken_beta) && $launchToken_beta eq $execrunid ) {
        undef $launchToken_beta;
        return 1;
    }
    return 0;
}

sub getViewerByDomain {
    my $domain = shift;
    foreach my $viewer (keys %{$_viewers}) {
        foreach my $project (keys %{$_viewers->{$viewer}}) {
            my $dom = $_viewers->{$viewer}{$project}->{'domain'};
            my $state = $_viewers->{$viewer}{$project}->{'state'};
            if (defined($dom) && $dom eq $domain) {
                return ($project, $viewer, $state);
            }
        }
    }
    return (undef, undef, undef);
}
sub saveViewerState {
    my $state = shift;
    my $viewer = $state->{'viewer'};
    my $project = $state->{'project'};
    my $prev = getViewerState($viewer, $project);
    $_viewers->{$viewer}{$project}->{'state'} = $state->{'state'};
    $_viewers->{$viewer}{$project}->{'ipaddr'} = $state->{'ipaddress'};
    $_viewers->{$viewer}{$project}->{'apikey'} = $state->{'apikey'};
    $_viewers->{$viewer}{$project}->{'urluuid'} = $state->{'urluuid'};
    $_viewers->{$viewer}{$project}->{'domain'} = $state->{'domain'};
    $_viewers->{$viewer}{$project}->{'vieweruuid'} = $state->{'vieweruuid'};

    _persistViewerState();

    return $prev;
}
sub _getViewerValue {
    my $viewer = shift;
    my $project = shift;
    my $key = shift;
    if (defined($_viewers->{$viewer}{$project}->{$key})) {
        return $_viewers->{$viewer}{$project}->{$key};
    }
    else {
        return 'UNDEFINED';
    }
}
sub getViewerUUID {
    my $viewer = shift;
    my $project = shift;
    return _getViewerValue($viewer, $project, 'vieweruuid');
}
sub getViewerURLuuid {
    my $viewer = shift;
    my $project = shift;
    return _getViewerValue($viewer, $project, 'urluuid');
}
sub getViewerapikey {
    my $viewer = shift;
    my $project = shift;
    return _getViewerValue($viewer, $project, 'apikey');
}
sub getViewerAddress {
    my $viewer = shift;
    my $project = shift;
    return _getViewerValue($viewer, $project, 'ipaddr');
}
sub getViewerState {
    my $viewer = shift;
    my $project = shift;
    return _getViewerValue($viewer, $project, 'state');
}
sub _setViewerCount {
    my $viewer = shift;
    my $project = shift;
    my $value = shift;
    $_viewers->{$viewer}{$project}->{'count'} = $value;
    _persistViewerState();
    return;
}
sub clearViewerCount {
    my $viewer = shift;
    my $project = shift;
    _setViewerCount($viewer, $project, 0);
    return;
}
sub incViewerCount {
    my $viewer = shift;
    my $project = shift;
    my $val = getViewerCount($viewer, $project);
    $val++;
    _setViewerCount($viewer, $project, $val);

    return $val;
}
sub getViewerCount {
    my $viewer = shift;
    my $project = shift;
    my $val = _getViewerValue($viewer, $project, 'count');
    if ($val eq 'UNDEFINED') {
        $val = 0;
    }
    return $val;
}

# Cleanup 
sub cleanupDomain {
    my $domain = shift;
    my $floodlight = shift;
    return deleteFlows($domain, $floodlight);
}
1;

__END__
=pod

=encoding utf8

=head1 NAME

=head1 SYNOPSIS

Write the Manual page for this package

=head1 DESCRIPTION

=head1 OPTIONS

=over 8

=item 


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
 

