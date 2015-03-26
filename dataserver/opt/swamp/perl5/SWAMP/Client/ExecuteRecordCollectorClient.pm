package SWAMP::Client::ExecuteRecordCollectorClient;

# This package is the interface between the AgentMonitor and the ExecuteRecordCollector  Service
use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

use RPC::XML;
use RPC::XML::Client;
use Log::Log4perl;
use Date::Parse qw(str2time);
use SWAMP::RPCUtils qw(rpccall);
use SWAMP::SWAMPUtils qw(getMethodName);

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      updateExecutionResults
      updateRunStatus
      getSingleExecutionRecord
      configureClient
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

# This is the server's address, normally the dispatcherAgent
my $uri = 'http://localhost:8083';
my $client;

sub configureClient {
    my $host = shift;
    my $port = shift;
    $uri = "http://$host:$port";
    undef $client;
    return;
}
#** @function updateRunStatus( $execrunid, $status, $finalStatus)
# @brief Update only the status field of the execution_record.
#
# @param execrunid The id of the run to which the status should be applied
# @param status The textual string containing the status which should be applied
# @param finalStatus Boolean indicating this update will be the end for this execrun id.
# @return 1 for success,0 otherwise
#*
sub updateRunStatus {
    my $execrunid   = shift;
    my $status      = shift;
    my $finalStatus = shift // 0;
    my $recordref   = getSingleExecutionRecord($execrunid);
    if ( !defined($recordref) ) {
        $recordref = {
            'run_date'                     => scalar localtime,
            'cpu_utilization'              => 'd__0',
            'lines_of_code'                => 'i__0',
            'execute_node_architecture_id' => 'unknown'
        };
    }
    else {
        # If the run_date has never been set, set it
        if (!defined($recordref->{'run_date'})) {
            $recordref->{'run_date'} = scalar localtime;
        }
    }
    $recordref->{'status'} = $status;
    if ($finalStatus) {
        $recordref->{'completion_date'} = scalar localtime;
    }
    else {
        delete $recordref->{'completion_date'} ;
    }
    my $res = updateExecutionResults( $execrunid, $recordref );
    if ( defined( $res->{'error'} ) ) {
        return 0;
    }
    return 1;
}

## PerlCritic cannot properly handle packages with multiple
# classes such as RPC::XML.pm.
## no critic (RequireExplicitInclusion)
sub getSingleExecutionRecord {
    my $execrunid = shift;

    my $method = getMethodName('EXEC_COLLECTOR_GETSINGLEEXECUTIONRECORD');
    my %map;
    $map{'execrunid'} = $execrunid;

    my $req = RPC::XML::request->new( $method, RPC::XML::struct->new(\%map) );
    my $result = rpccall( getClient(), $req );
    # Convert date strings back to epoch times
    if (defined($result)) {
        # Patch up the record if necessary so that it can be sent back thru updateExecutionResults.
        if (defined($result->{'run_date'})) {
            if ($result->{'run_date'} ne 'null') {
                $result->{'run_date'} = scalar localtime str2time($result->{'run_date'});
            }
            else {
                delete $result->{'run_date'};
            }
        }
        if (defined($result->{'lines_of_code'})) {
            if ($result->{'lines_of_code'} eq 'null') {
                $result->{'lines_of_code'} = 'i__0';
            }
            else {
                $result->{'lines_of_code'} = "i__$result->{'lines_of_code'}";
            }
        }
        if (defined($result->{'execute_node_architecture_id'} )) {
            if ($result->{'execute_node_architecture_id'} eq 'null') {
                $result->{'execute_node_architecture_id'} = 'unknown';
            }
        }
        if (defined($result->{'cpu_utilization'} )) {
            if ($result->{'cpu_utilization'} eq 'null') {
                $result->{'cpu_utilization'} = 'd__0';
            }
            else {
                $result->{'cpu_utilization'} = "d__$result->{'cpu_utilization'}";
            }
        }
        if (defined($result->{'completion_date'})) {
            if ($result->{'completion_date'} ne 'null') {
                # Ignore 0 and negative numbers
                my $timeVal = str2time($result->{'completion_date'});
                if ($timeVal > 1) {
                    $result->{'completion_date'} = scalar localtime $timeVal;
                }
                else {
                    delete $result->{'completion_date'};
                }
            }
            else {
                delete $result->{'completion_date'};
            }
        }
    }
    return $result;
}
#** @function updateExecutionResults($execrunid, $recordref)
# @brief Send the execution record information to the dispatcher for storage in the DB
#
# @param execrunid The execute record uuid which this record is associated
# @param recordref The execute record contents, including but not limited to...
#  execution_record_uuid        VARCHAR(45) NOT NULL                         COMMENT 'execution record uuid',
#  status                       VARCHAR(25) NOT NULL DEFAULT 'INVALID'       COMMENT 'status of execution record',
#  run_date                     TIMESTAMP NULL DEFAULT NULL                  COMMENT 'run begin timestamp',
#  completion_date              TIMESTAMP NULL DEFAULT NULL                  COMMENT 'run completion timestamp',
#  queued_duration              VARCHAR(12)                                  COMMENT 'string run date minus create date',
#  execution_duration           VARCHAR(12)                                  COMMENT 'string completion date minus run date',
#  execute_node_architecture_id VARCHAR(12)                                  COMMENT 'execute note id',
#  lines_of_code                INT                                          COMMENT 'loc analyzed',
#  cpu_utilization              VARCHAR(12)                                  COMMENT 'cpu utilization',
# @return
#*
sub updateExecutionResults {
    my $execrunid = shift;
    my $recordref = shift;

    # Add other parameters to the hash
    $recordref->{'execrunid'} = $execrunid;
    $recordref->{'timestamp'} = "i__" . time;
    my $method = shift || getMethodName('EXEC_COLLECTOR_UPDATERESULT');
    my $req = RPC::XML::request->new( $method, RPC::XML::struct->new($recordref) );

    return rpccall( getClient(), $req );
}

sub getClient {
    if ( !defined($client) ) {
        $client = RPC::XML::Client->new($uri);
    }
    return $client;
}

1;

__END__
=pod

=encoding utf8

=head1 NAME

ExecuteRecordCollectorClient - client interface for collecting assessment run execution records

=head1 SYNOPSIS

Write Manual page for this package

=head1 DESCRIPTION

=head1 OPTIONS

=over 8

=item 


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
