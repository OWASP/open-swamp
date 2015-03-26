#!/usr/bin/env perl 
#** @file notifyuser.pl
#
# @brief This script will handle notifying users about SWAMP events. Currently assessment complete is the only event
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 08/06/2014 20:45:18
# @copy Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
# The dependency on which medium (mail, SMS, etc) should be isolated
# The template for email should come from a config file so that it can be changed
# without requiring a reinstall
#
# Additional media: Twitter, SMS, webhook

use 5.014;
use utf8;
use warnings;
use strict;
use FindBin qw($Bin);
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );

use Getopt::Long qw/GetOptions/;
use Pod::Usage qw/pod2usage/;
use English '-no_match_vars';
use File::Basename qw(basename);
use Carp qw(carp croak);
use ConfigReader::Simple;
use Log::Log4perl;
use Log::Log4perl::Level;

use SWAMP::SysUtils qw(daemonize);
use SWAMP::Notification qw(getNotifier);

use SWAMP::SWAMPUtils qw(
  diewithconfess
  getLoggingConfigString
  getSwampConfig
  getSWAMPDir
  systemcall
);

our $VERSION = '0.00';
my %options = (
    'man'    => 0,
    'help'   => 0,
    'debug'  => 0,
    'transmission_medium'  => q{EMAIL},
    'daemon' => 1
);
my @optionNames = qw(
  daemon!
  debug
  notification_uuid=s
  transmission_medium=s
  user_uuid=s
  notification_impetus=s
  success_or_failure=s
  project_name=s
  package_name=s
  package_version=s
  tool_name=s
  tool_version=s
  platform_name=s
  platform_version=s
  completion_date=s
  help|?
  man
);

Log::Log4perl->init( getLoggingConfigString() );

GetOptions( \%options, @optionNames )
  or pod2usage(2);

if ( $options{'help'} ) { pod2usage(1); }
if ( $options{'man'} ) { pod2usage( '-verbose' => 2 ); }

my $log = Log::Log4perl->get_logger(q{});
$log->level( $options{'debug'} ? $TRACE : $INFO );

if ( $options{'daemon'} ) {
    daemonize();
}

my $notifier = getNotifier($options{'transmission_medium'});
if ($notifier->(%options)) {
    $log->info("Notifier succeeded");
}
else {
    $log->error("Notifier failed");
}

#
#** @function logtag( )
# @brief Get this application's tag for calls to syslog
#
# @return the text tag to use in calls to syslog
# @see #logfilename
#*
sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

#** @function logfilename( )
# @brief Get this application's logfile name.
#
# @return the abs_path to this application's log file.
# @see #logtag
#*
sub logfilename {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    $name = basename($name);
    return getSWAMPDir() . "/log/${name}.log";
}

__END__
=pod

=encoding utf8

=head1 NAME

notifyuser.pl

=head1 SYNOPSIS

notifyuser.pl [options]

=head1 DESCRIPTION

This script will notify a user of the completion of their assessment run. 

=head1 OPTIONS

=over 8

=item --man

Show manual page for this script

=item --help

Show usage information for this script

=item --notification_uuid 

Group uuid

=item --transmission_medium

=item --user_uuid Recipient

=item --notification_impetus 

Reason for notification e.g. "Assessment Result Finished"

=item --success_or_failure

=item --project_name 

Name of the project which was input to this notification

=item --package_name 

Name of the package which was input to this notification

=item --package_version 

Version of the package which was input to this notification

=item --tool_name 

Name of the tool which was input to this notification

=item --tool_version 

Version of the package which was input to this notification

=item --platform_name 

Name of the platform which was input to this notification

=item --platform_version 

Version of the platform which was input to this notification

=item --completion_date 

Date the event completed

=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut


