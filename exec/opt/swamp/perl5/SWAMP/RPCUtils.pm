#** @file RPCUtils.pm
# 
# @brief RPC related functions
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
package SWAMP::RPCUtils;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use RPC::XML;
use RPC::XML::Client;
use Log::Log4perl;

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      rpccall
      okReturn
      getReturnError
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);


sub logWarn {
    if (Log::Log4perl->initialized()) {
        my $msg = shift;
        Log::Log4perl->get_logger(q{})->warn($msg);
#        Log::Log4perl->get_logger(q{})->logconfess();
        
    }
    return;
}

sub okReturn {
    my $return = shift;
    return !defined($return->{'error'});
}
sub getReturnError {
    my $return = shift;
    if (defined($return->{'error'})) {
        return $return->{'error'};
    }
    return -1;
}

# Common method for managing the
# RPC send_request call and results.
#** @function rpccall($client, $req )
# @brief Common method for managing the RPC send_request call and results.
#
# @param client The XMLRPC client (RPC::XML::Client->new object) to which the request should be sent
# @param req The XMLRPC request (RPC::XML::request->new object) containing the method and parameters
# @return The result of the XMLRPC call or a hashmap containing the key 'error' and the result of the call.
#*
sub rpccall {
    my $client = shift;
    my $req    = shift;
    if (defined($req)) {
            my $res    = $client->send_request($req);
        if ( ref $res ) {
            if ( $res->is_fault ) {
                my $str = $req->as_string();
                logWarn("rpccall: fault returned:$str () ". $res->value);
                return { 'error' => $res->value, 'fault' => 1 };
            }
            else {
#                logWarn("rpccall: returning ".$res->value);
                return $res->value;
            }
        }
        else {
            my $str = $req->as_string();
            logWarn("rpccall: did not get a ref back: $str () $res");
            return { 'error' => 'did not get a ref back', 'text' => $res };
        }
    }
    else {
        return { 'error' => 'XMLRequest undefined' };
    }
}

1;

__END__
=pod

=encoding utf8

=head1 NAME

=head1 SYNOPSIS

Manual page for this package

=head1 DESCRIPTION

=head1 OPTIONS

=over 8

=item 


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
