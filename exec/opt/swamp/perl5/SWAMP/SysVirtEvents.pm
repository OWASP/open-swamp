#** @file SysVirtEvents.pm
# 
# @brief RPC related functions
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
package SWAMP::SysVirtEvents;

use 5.014;
use utf8;
use warnings;
use strict;
use parent qw(Exporter);

use English '-no_match_vars';
use Carp 'croak';

use Sys::Virt;
use Sys::Virt::Domain;
use Sys::Virt::Event;

BEGIN {
    our $VERSION = '1.00';
}

our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(getEventInformation);
}

# Cannot quote these bare words, they are constants defined in a thirdparty library.
## no critic (ProhibitHashBarewords)
my %eventreasons = (
    Sys::Virt::Domain::EVENT_DEFINED => {
        'name' => 'defined',
        Sys::Virt::Domain::EVENT_DEFINED_ADDED =>
          "The defined configuration is newly added",
        Sys::Virt::Domain::EVENT_DEFINED_UPDATED =>
          "The defined configuration is an update to an existing configuration",
    },
    Sys::Virt::Domain::EVENT_RESUMED => {
        'name' => "resumed",
        Sys::Virt::Domain::EVENT_RESUMED_MIGRATED =>
"The domain resumed because migration has completed. This is emitted on the destination host.",
        Sys::Virt::Domain::EVENT_RESUMED_UNPAUSED =>
          "The domain resumed because the admin unpaused it.",
        Sys::Virt::Domain::EVENT_RESUMED_FROM_SNAPSHOT =>
          "The domain resumed because it was restored from a snapshot",
    },
    Sys::Virt::Domain::EVENT_STARTED => {
        'name' => "started",
        Sys::Virt::Domain::EVENT_STARTED_BOOTED =>
          "The domain was booted from shutoff state",
        Sys::Virt::Domain::EVENT_STARTED_MIGRATED =>
          "The domain started due to an incoming migration",
        Sys::Virt::Domain::EVENT_STARTED_RESTORED =>
          "The domain was restored from saved state file",
        Sys::Virt::Domain::EVENT_STARTED_FROM_SNAPSHOT =>
          "The domain was restored from a snapshot",
        Sys::Virt::Domain::EVENT_STARTED_WAKEUP =>
          "The domain was woken up from suspend",
    },
    Sys::Virt::Domain::EVENT_STOPPED => {
        'name' => "stopped",
        Sys::Virt::Domain::EVENT_STOPPED_CRASHED =>
          "The domain stopped because guest operating system has crashed",
        Sys::Virt::Domain::EVENT_STOPPED_DESTROYED =>
          "The domain stopped because administrator issued a destroy command.",
        Sys::Virt::Domain::EVENT_STOPPED_FAILED =>
"The domain stopped because of a fault in the host virtualization environment.",
        Sys::Virt::Domain::EVENT_STOPPED_MIGRATED =>
          "The domain stopped because it was migrated to another machine.",
        Sys::Virt::Domain::EVENT_STOPPED_SAVED =>
          "The domain was saved to a state file",
        Sys::Virt::Domain::EVENT_STOPPED_SHUTDOWN =>
          "The domain stopped due to graceful shutdown of the guest.",
        Sys::Virt::Domain::EVENT_STOPPED_FROM_SNAPSHOT =>
          "The domain was stopped due to a snapshot",
    },
    Sys::Virt::Domain::EVENT_SHUTDOWN => {
        'name' => "shutdown",
        Sys::Virt::Domain::EVENT_SHUTDOWN_FINISHED =>
          "The domain finished shutting down",
    },
    Sys::Virt::Domain::EVENT_SUSPENDED => {
        'name' => "suspended",
        Sys::Virt::Domain::EVENT_SUSPENDED_MIGRATED =>
          "The domain has been suspended due to offline migration",
        Sys::Virt::Domain::EVENT_SUSPENDED_PAUSED =>
          "The domain has been suspended due to administrator pause request.",
        Sys::Virt::Domain::EVENT_SUSPENDED_IOERROR =>
          "The domain has been suspended due to a block device I/O error.",
        Sys::Virt::Domain::EVENT_SUSPENDED_FROM_SNAPSHOT =>
          "The domain has been suspended due to resume from snapshot",
        Sys::Virt::Domain::EVENT_SUSPENDED_WATCHDOG =>
          "The domain has been suspended due to the watchdog triggering",
        Sys::Virt::Domain::EVENT_SUSPENDED_RESTORED =>
          "The domain has been suspended due to restore from saved state",
    },
    Sys::Virt::Domain::EVENT_UNDEFINED => {
        'name' => "undefined",
        Sys::Virt::Domain::EVENT_UNDEFINED_REMOVED =>
"The domain configuration has gone away due to it being removed by administrator.",
    },
    Sys::Virt::Domain::EVENT_PMSUSPENDED => {
        'name' => "pmsuspended",
        Sys::Virt::Domain::EVENT_PMSUSPENDED_MEMORY =>
          "The domain has suspend to RAM.",
    }
);

# Need Range checking!
sub getEventInformation {
    my ( $eventId, $reasonId ) = @_;

    return ( $eventreasons{$eventId}{'name'},
        $eventreasons{$eventId}{$reasonId} );
}
1;

__END__
=pod

=encoding utf8

=head1 NAME


=head1 SYNOPSIS



=head1 DESCRIPTION

=head1 OPTIONS

=over 8

=item --man

Show manual page for this script

=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
