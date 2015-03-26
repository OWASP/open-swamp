#** @file RunControllerClient.pm
#
# @brief This file contains the client interface to the AgentDispatcher's doRun method
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

package SWAMP::Client::RunControllerClient;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

use RPC::XML;
use RPC::XML::Client;
use Log::Log4perl;
use SWAMP::RPCUtils qw(rpccall);
use SWAMP::SWAMPUtils qw(getMethodName);

#** @class SWAMP::Client::RunControllerClient
# This package contains the client interface to the AgentDispatcher. Perl clients wishing to communicate with the Agent Dispatcher
# should use this package's functions.
#*
BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      configureClient
      doRun
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

my $uri = 'http://localhost:8083';
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
    logDebug("RunControllerClient::configureClient: $uri");
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

sub doRun {
    my $execrunid = shift;
    my $req =
      RPC::XML::request->new( getMethodName('RUNCONTROLLER_DORUN'), RPC::XML::struct->new({'execrunid' => $execrunid }) );
    logDebug("RunControllerClient::launchPadStart on $uri execid is $execrunid");
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
