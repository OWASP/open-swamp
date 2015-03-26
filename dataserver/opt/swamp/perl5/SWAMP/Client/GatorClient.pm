package SWAMP::Client::GatorClient;

# This package is the interface for the Gator client
use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use Cwd qw(abs_path);

use RPC::XML;
$RPC::XML::FORCE_STRING_ENCODING = 1;
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
      configureClient
      getBillOfGoods
      insertExecEvent
      insertSystemStatus
      listMethods
      listPackages
      listPlatforms
      listTools
      storeviewer
      updateviewerinstance
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

# This is the server's address
my $uri = 'http://localhost:8083';

sub logDebug {
    if ( Log::Log4perl->initialized() ) {
        my $msg = shift;
        Log::Log4perl->get_logger(q{})->debug($msg);
    }
    return;
}

sub configureClient {
    my $host = shift;
    my $port = shift;
    $uri = "http://$host:$port";
    logDebug("GatorClient::configureClient: $uri");
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

#** @function listTools( \%mapref)
# @brief This method calls the gator.listTools method on the
# dispatcher interface.
#
# @return results of rpccall containing all available tools
# @see {@link SWAMP::RPCUtils::rpccall}
#
#*

sub listTools {
    my $userUri = shift || $uri;
    my $method  = shift || getMethodName('GATOR_LISTTOOLS');
    my $client  = RPC::XML::Client->new($userUri);
    my $req     = RPC::XML::request->new($method);
    my $ret = rpccall( $client, $req );
    return $ret;
}

sub insertExecEvent {
    my $mapref = shift;
    my $method = getMethodName('ADMIN_INSERT_EXEC_EVENT');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new( $method, RPC::XML::struct->new($mapref) );
    my $ret    = rpccall( $client, $req );
    return $ret;
}
sub insertSystemStatus {
    my $mapref = shift;
    my $method = getMethodName('ADMIN_INSERT_SYSTEM_STATUS');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new( $method, RPC::XML::struct->new($mapref) );
    my $ret    = rpccall( $client, $req );
    return $ret;
}

#** @function listPackages( \%mapref)
# @brief This method calls the gator.listPackages method on the
# dispatcher interface.
#
# @return results of rpccall containing all available packages
# @see {@link SWAMP::RPCUtils::rpccall}
#*

sub listPackages {
    my $userUri = shift || $uri;
    my $method  = shift || getMethodName('GATOR_LISTPACKAGES');
    my $client  = RPC::XML::Client->new($userUri);
    my $req     = RPC::XML::request->new($method);
    my $ret = rpccall( $client, $req );
    return $ret;
}

sub listPlatforms {
    my $method = getMethodName('GATOR_LISTPLATFORMS');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new($method);
    return rpccall( $client, $req );
}

sub getBillOfGoods {
    my $mapref = shift;
    my $method = getMethodName('QUARTERMASTER_BILLOFGOODS');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new( $method, RPC::XML::struct->new($mapref) );
    return rpccall( $client, $req );
}

sub storeviewer {
    my $mapref = shift;
    my $method = getMethodName('QUARTERMASTER_STOREVIEWER');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new( $method, RPC::XML::struct->new($mapref) );
    return rpccall( $client, $req );
}

#** @function updateviewerinstance( )
# @brief Update the viewer instance table for the specified viewer.
#
# @param  map Hashmap containing the following keys:
#   'vieweruuid' => the viewer uuid being specified
#   'viewerstatus' => string containing status of the viewer
#   'vieweraddress' => string containing ip address of the VM hosting the viewer
#   'viewerproxyurl' => string containing the proxy URL of the viewer
# @return
# @see
#*
sub updateviewerinstance {
    my $mapref = shift;
    my $method = getMethodName('QUARTERMASTER_UPDATEVIEWER');
    my $client = RPC::XML::Client->new($uri);
    my $req    = RPC::XML::request->new( $method, RPC::XML::struct->new($mapref) );
    return rpccall( $client, $req );
}
## use critic
1;

__END__
=pod

=encoding utf8

=head1 NAME

GatorClient - interface to the Gator service

=head1 SYNOPSIS

use GatorClient

=head1 DESCRIPTION

GatorClient implements the listTools, listPackages methods

=head1 OPTIONS

=over 8

=back


=head1 SEE ALSO

=cut
