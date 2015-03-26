#** @file SysUtils.pm
#
# @brief System level utility methods
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 11/22/2013 15:21:30
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::SysUtils;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use FindBin qw($Bin);
use File::Spec qw(devnull);

use POSIX qw(setsid);
BEGIN {
    our $VERSION = '0.84';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      sysinfo
      daemonize
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

sub daemonize {
    chdir(q{/});
    open( STDIN, '<', File::Spec->devnull )
      || croak "can't read /dev/null: $OS_ERROR";
    open( STDOUT, '>', File::Spec->devnull )
      || croak "can't write to /dev/null: $OS_ERROR";
    defined( my $pid = fork() ) || croak "can't fork: $OS_ERROR";
    exit if $pid;    # non-zero now means I am the parent
    ( setsid() != -1 ) || croak "Can't start a new session: $OS_ERROR";
    open( STDERR, ">&STDOUT" ) || carp "Can't open STDERR $OS_ERROR";
    return;
}

sub sysinfo {
    my $nProc  = 4;
    my $nCores = 16;
    my $memGB  = 4;
    if ( open( my $fh, '<', '/proc/cpuinfo' ) ) {
        $nProc  = 0;
        $nCores = 0;
        while (<$fh>) {
            if (/^processor/sxm) {
                $nProc++;
            }
            if (/^cpu cores/sxm) {
                chomp;
                my ( $name, $cores ) = split( /:/sxm, $_ );
                $nCores += $cores;
            }
        }
        if ( !close($fh) ) {

        }
        if ( open( my $fh, '<', '/proc/meminfo' ) ) {
            while (<$fh>) {
                if (/^MemTotal:/sxm) {
                    my $name;
                    chomp;
                    ( $name, $memGB ) = split( /:/sxm, $_ );
                    $memGB =~ s/kB//sxm;
                    $memGB /= ( 1024 * 1024 );
                }
            }
            if ( !close($fh) ) {

            }
        }
    }
    else {
        if ( open( my $fh, q{-|}, 'sysctl -a hw' ) ) {
            $nProc  = 0;
            $nCores = 0;
            $memGB  = 0;
            while (<$fh>) {
                if (/hw.physicalcpu:/sxm) {
                    chomp;
                    my $junk;
                    ( $junk, $nProc ) = split( /:/sxm, $_ );
                }
                if (/hw.memsize:/sxm) {
                    chomp;
                    my $junk;
                    ( $junk, $memGB ) = split( /:/sxm, $_ );
                    $memGB /= ( 1024 * 1024 );
                }
            }
            if ( !close($fh) ) {

            }
        }
    }
    return ( $nProc, $nCores, $memGB );
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
 

