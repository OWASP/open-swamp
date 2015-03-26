#!/usr/bin/env perl 
#** @file killrun.pl
#
# @brief This is a generic script for stopping running SWAMP jobs, whether they are a-runs, b-runs or v-runs.
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 05/19/2014 13:11:14
# @copy Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research
#*

use 5.014;
use utf8;
use warnings;
use strict;
use FindBin qw($Bin);
use lib ( "$FindBin::Bin/../perl5", "$FindBin::Bin/lib" );

use File::Basename qw(basename fileparse);
use Getopt::Long qw/GetOptions/;
use Pod::Usage qw/pod2usage/;
use English '-no_match_vars';
use Carp qw(carp croak);
use Cwd qw(getcwd abs_path);
use Log::Log4perl::Level;
use Log::Log4perl;
use SWAMP::Client::AgentClient qw(configureClient csaAgentStop);
use SWAMP::SWAMPUtils
  qw( diewithconfess getLoggingConfigString getSwampConfig getSWAMPDir getBuildNumber );

my $help       = 0;
my $man        = 0;
my $startupdir = getcwd;
my $asdaemon   = 1;
my $debug      = 0;
my $execution_record_uuid;
our $VERSION = '0.00';

GetOptions(
    'execution_record_uuid=s' => \$execution_record_uuid,
    'help|?'                  => \$help,
    'man'                     => \$man,
) or pod2usage(2);

if ($help) { pod2usage(1); }
if ($man) { pod2usage( '-verbose' => 2 ); }

chdir($startupdir);

Log::Log4perl->init( getLoggingConfigString() );

my $log = Log::Log4perl->get_logger(q{});
$log->level( $debug ? $TRACE : $INFO );

# Turn off logging to Screen appender
Log::Log4perl->get_logger(q{})->remove_appender('Screen');

# Catch anyone who calls die.
local $SIG{'__DIE__'} = \&diewithconfess;

my $ver = "$VERSION." . getBuildNumber();
$log->info("$PROGRAM_NAME v$ver: killrun");

my $config     = getSwampConfig();
my $serverPort = $config->get('agentMonitorJobPort');
my $serverHost = $config->get('agentMonitorHost');
SWAMP::Client::AgentClient::configureClient( $serverHost, $serverPort );

if ($execution_record_uuid) {
    csaAgentStop( { 'execrunid' => $execution_record_uuid } );
}

sub logtag {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    return basename($name);
}

sub logfilename {
    ( my $name = $PROGRAM_NAME ) =~ s/\.pl//sxm;
    $name = basename($name);
    return getSWAMPDir() . "/log/${name}.log";
}

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


