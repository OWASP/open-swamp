#** @file Locking.pm
#
# @brief  Simple advisory locking helpers.
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 12/31/2013 14:08:08
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::Locking;

use 5.010;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

BEGIN {
    our $VERSION = '0.84';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      swamplock
      swampunlock
    );
}

use Fcntl qw(LOCK_UN LOCK_NB LOCK_EX O_RDONLY O_CREAT);
use English '-no_match_vars';
use Carp qw(croak carp);

my %locks;

sub _cleanToken {
    my $token = shift;
    $token =~ s/\s//sxm;
    $token =~ s/[:\?]//sxm;
    return $token;
}

#** @function swamplock( $token )
# @brief Place an advisory lock on a file
#
# @param $token filename to lock, will be created if it does not exist
# @return true if the lock was able to be placed on the file, false otherwise
# @see swampunlock
#*
sub swamplock {
    my $token = _cleanToken(shift);
    my $ret   = 0;

    if ( sysopen my $fh, $token, O_RDONLY | O_CREAT ) {
        if ( flock $fh, ( LOCK_EX | LOCK_NB ) ) {
            $locks{$token} = $fh;
            $ret = 1;
        }
        else {
            say "Cannot flock $token $OS_ERROR";
        }
    }
    else {
        say "Cannot open $token $OS_ERROR";
    }
    return $ret;
}

#** @function swampunlock( $token, $unlink )
# @brief Remove advisory lock on a file
#
# @param $token filename on which the advisory lock should be removed
# @param $unlink Flag indicating the file should also be removed after unlocking.
# @return
# @see
#*
sub swampunlock {
    my $token  = _cleanToken(shift);
    my $unlink = shift // 0;
    my $ret    = 0;
    if ( exists( $locks{$token} ) ) {
        if ( !flock $locks{$token}, ( LOCK_UN | LOCK_NB ) ) {
            return 0;
        }
        if ( close( $locks{$token} ) ) {
            if ($unlink) { unlink $token; }
            delete $locks{$token};
            $ret = 1;
        }
    }
    return $ret;
}

sub releaseAllLocks {
    foreach my $token ( keys %locks ) {
        swampunlock($token);
    }
    return;
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
 

