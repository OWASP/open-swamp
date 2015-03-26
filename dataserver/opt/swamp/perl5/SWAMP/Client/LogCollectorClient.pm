#** @file LogCollectorClient.pm
# @brief Package containing the client interface between the AgentMonitor and the LogCollector
#
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
package SWAMP::Client::LogCollectorClient;

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
use SWAMP::SWAMPUtils qw(getMethodName checksumFile);

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      logStatus
      logLog
      listMethods
      configureClient
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

# This is the server's address
my $uri = 'http://localhost:8083';

sub logInfo {
    if ( Log::Log4perl->initialized() ) {
        my $msg = shift;
        Log::Log4perl->get_logger(q{})->info($msg);
    }
    return;
}
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
    logInfo("LogCollectorClient::configureClient: $uri");
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

sub logStatus {
    my $timestamp = shift;
    my $execrunid = shift;
    my $statusref = shift;
    my $userUri   = shift || $uri;
    my $method    = shift || getMethodName('LOG_COLLECTOR_LOGSTATUS');
    if ( ref($statusref) ne "HASH" ) {
        warn "LogStatus:Expected a hash ref for status, got "
          . ref($statusref) . "\n";
    }
    my %map = ( 'execrunid' => $execrunid, 'timestamp' => $timestamp );
    foreach my $key ( keys %{$statusref} ) {
        $map{ 'statusInfo.' . $key } = ${$statusref}{$key};
    }
    my $client = RPC::XML::Client->new($userUri);
    my $req = RPC::XML::request->new( $method, RPC::XML::struct->new( \%map ) );
    return rpccall( $client, $req );
}

#    my $method    = shift || getMethodName('LOG_COLLECTOR_LOGLOG');
sub logLog {
    my $execrunid = shift;
    my $pathname  = shift;
    my $checksum  = shift;
    my $userUri   = shift || $uri;
    my $method    = shift || getMethodName('LOG_COLLECTOR_LOGLOG');
    my $client    = RPC::XML::Client->new($userUri);
    my $req       = RPC::XML::request->new(
        $method,
        RPC::XML::struct->new(
            'execrunid' => $execrunid,
            'pathname'  => abs_path($pathname),
            'sha512sum'  => $checksum
        )
    );

	return rpccall( $client, $req );
}

1;

__END__
=pod

=encoding utf8

=head1 NAME

LogCollectorClient - methods for creation and manipulating VMs

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
