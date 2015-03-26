package SWAMP::Client::ResultCollectorClient;

# This package is the interface between the AgentMonitor and the ResultCollector Service
use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use Cwd qw(abs_path);

use RPC::XML;
use RPC::XML::Client;
use Log::Log4perl;
use SWAMP::RPCUtils qw(rpccall);
use SWAMP::SWAMPUtils qw(getMethodName);

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      saveResult
      configureClient
      listMethods
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

# This is the server's address
my $uri = 'http://localhost:8083';

sub logDebug {
    if (Log::Log4perl->initialized()) {
        my $msg = shift;
        Log::Log4perl->get_logger(q{})->debug($msg);
    }
    return;
}
sub configureClient {
    my $host = shift;
    my $port = shift;
    $uri = "http://$host:$port";
    logDebug("ResultCollectorClient::configureClient: $uri");
    return;
}

sub listMethods {
    my $userUri = shift || $uri;
    my $client  = RPC::XML::Client->new($userUri);
    my $resp    = $client->send_request('system.listMethods');
    if ( ref($resp) ) {
        return $resp->value;
    }
    return;
}

## PerlCritic cannot properly handle packages with multiple
# classes such as RPC::XML.pm.
## no critic (RequireExplicitInclusion)

#** @function saveResult( \%mapref)
# @brief This method calls the result collector.saveResult method on the
# agentMonitor interface, providing it with a execrun id and path to results
#
# @param mapref Reference to a hash containing at least two keys 'execrunid' and 'pathname' and optionally 'sha512sum'
# @return results of rpccall
# @see {@link SWAMP::RPCUtils::rpccall}
#*

sub saveResult {
    my $mapref = shift;
    my $userUri   = shift || $uri;
    my $method    = shift || getMethodName('RESULT_COLLECTOR_SAVERESULT');
    my $client    = RPC::XML::Client->new($userUri);
    logDebug( "saveResult($mapref->{'execrunid'}, $mapref->{'pathname'}) $userUri");
    if (!defined($mapref->{'pathname'})) {
        return {'error', 'hash is missing pathname' };
    }
    if (!defined($mapref->{'execrunid'})) {
        return {'error', 'hash is missing execrunid' };
    }
    if ($mapref->{'pathname'} ne abs_path($mapref->{'pathname'})) {
        return {'error', "pathname is not canonical $mapref->{'pathname'} vs ".abs_path($mapref->{'pathname'}) };
    }
    my $req       = RPC::XML::request->new( $method, RPC::XML::struct->new( $mapref ));
    return rpccall($client, $req);
}
## use critic
1;

__END__
=pod

=encoding utf8

=head1 NAME

ResultCollectorClient - interface to the Result Collector service

=head1 SYNOPSIS

use ResultCollectorClient

=head1 DESCRIPTION

ResultCollectorClient implements the saveResult($execrunid, $pathname) method

=head1 OPTIONS

$execrunid - the execute run id of the associated assessment run.

$pathname - the pathname of the result file to be saved

$sha512sum - the sha1512 digest of pathname

=over 8

=back


=head1 SEE ALSO

L<LogCollectorClient|LogCollectorClient>

=cut
