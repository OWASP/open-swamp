#** @file HTCondorDefines.pm
# 
# @brief constants defined in HTCondor
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 08/01/13 12:40:57
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*

package SWAMP::HTCondorDefines;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

BEGIN {
    our $VERSION = '1.00';
}

use English '-no_match_vars';
use Carp qw(croak carp);

use constant {
    'Submit'                 => 0,
    'Execute'                => 1,
    'Executable_error'       => 2,
    'Checkpointed'           => 3,
    'Job_evicted'            => 4,
    'Job_terminated'         => 5,
    'Image_size'             => 6,
    'Shadow_exception'       => 7,
    'Generic'                => 8,
    'Job_aborted'            => 9,
    'Job_suspended'          => 10,
    'Job_unsuspended'        => 11,
    'Job_held'               => 12,
    'Job_released'           => 13,
    'Node_execute'           => 14,
    'Node_terminated'        => 15,
    'Post_script_terminated' => 16,
    'Globus_submit'          => 17,
    'Globus_submit_failed'   => 18,
    'Globus_resource_up'     => 19,
    'Globus_resource_down'   => 20,
    'Remote_error'           => 21
};

1;

__END__
=pod

=encoding utf8

=head1 NAME

=head1 SYNOPSIS

HTCondor job log event ids

=head1 DESCRIPTION

=head1 CONSTANTS

=over 4

    Submit                 = 0
    Execute                = 1
    Executable_error       = 2
    Checkpointed           = 3
    Job_evicted            = 4
    Job_terminated         = 5
    Image_size             = 6
    Shadow_exception       = 7
    Generic                = 8
    Job_aborted            = 9
    Job_suspended          = 10
    Job_unsuspended        = 11
    Job_held               = 12
    Job_released           = 13
    Node_execute           = 14
    Node_terminated        = 15
    Post_script_terminated = 16
    Globus_submit          = 17
    Globus_submit_failed   = 18
    Globus_resource_up     = 19
    Globus_resource_down   = 20
    Remote_error           = 21

=back

=head1 SEE ALSO

=cut
 

