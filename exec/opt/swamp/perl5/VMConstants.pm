package VMConstants;

use 5.010;
use utf8;
use strict;
use warnings;

BEGIN {
    $VMConstants::VERSION = '1.00';
}

use constant { 
    'DEFAULT_OUTSIZE_MB' => 20,
    'DEFAULT_NCPU'    => 2,
    'DEFAULT_RAM_MB'  => 6144,
    'MAX_OUTSIZE_MB'  => 200,
    'MAX_HYPERMEM_MB'  => 32_768 };

1;
__END__

=pod

=encoding utf8

=head1 NAME

VMTools - methods for creation and manipulating VMs 

=head1 SYNOPSIS

  use VMTools;

  my $vmname="rhel6VM1";
  VMTools::init($vmname, "logging identity");

  if (VMTools::vmExists($vmname)) {
    VMTools::startVM($vmname);
  }

  VMTools::pkgshutdown();

=head1 VERSION

version 0.900

=head1 DESCRIPTION

This package implements methods for creation and manipulation of VM images.

=over 4

=item logMsg

Write message to logs

@param message textual message to log

=item errorMsg

Write message to logs and standard error

@param message textual message to log

=back

=over 4

=item systemcall

  ($output, $status) = VMTools::systemcall("command");

Executes a command via Perl's L<system|system> function and returns STDOUT
and STDERR as output and the command's exit code as status.

@param command - the command to execute

@return output - the STDOUT of the execution

@return status - the return status code

=back

=cut

