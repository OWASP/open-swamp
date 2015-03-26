#** @file SWAMPUtils.pm
#
# @brief Utility methods for SWAMP applications
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
package SWAMP::SWAMPUtils;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use FindBin qw($Bin);

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      checksumFile
      createBOGfileName
      createDomainPIDFile
      createhtaccess
      diewithconfess
      findConfig
      getBuildNumber
      getDomainStateFilename
      getHostAndPort
      getHostIP
      getHostname
      getJobDir
      getJobFilename
      getLoggingConfigString
      getMethodName
      getSWAMPDir
      getSwampConfig
      getUUID
      loadProperties
      makeoption
      makezip
      makePIDFilename
      readDomainPIDFile
      removehtaccess
      removeDomainPIDFile
      pid_extension
      saveProperties
      safecsvstring
      start_process
      stop_process
      systemcall
      trim
      uname
	  condor_chirp
    );
}

use English '-no_match_vars';
use Fcntl qw(LOCK_UN LOCK_NB LOCK_EX O_WRONLY O_CREAT O_EXCL);
use Carp qw(croak longmess carp);
use ConfigReader::Simple;
use Cwd qw(abs_path);
use Data::UUID;
use Digest::SHA;
use File::Spec qw(catfile);
use File::Basename qw(basename);
use File::Path qw(remove_tree make_path);
use Log::Log4perl;
use Socket qw(inet_ntoa inet_aton AF_INET);

use constant {
    'DEFAULT_CONFIG' => abs_path("$FindBin::Bin/../etc/swamp.conf"),
    'ALIVE' => q{alive},    # signal of a functional exec node
    'DEAD'  => q{dead},     # signal of a non-functional exec node
    'AWOL'  => q{awol},     # signal of a non-functional exec node that hasn't reported back
};

sub getSWAMPDir {
    return abs_path("$FindBin::Bin/..");
}

#** @function diewithconfess( )
# @brief A replacement DIE handler that does not invoke fatal.
#
# @return does not return, but exits with value 3.
#*
sub diewithconfess {
    if ($EXCEPTIONS_BEING_CAUGHT) {

# Don't exit within an eval. $EXCEPTIONS_BEING_CAUGHT is Perl interpreter state and 1 iff parsing an eval.
        return;
    }
    Log::Log4perl->get_logger(q{})->error( Carp::longmess(@_) );
    exit 3;
}

sub getBuildNumber {
    my $config = getSwampConfig();
    my $num    = $config->get('buildnumber');
    return defined($num) ? $num : '0';
}

sub getSwampConfig {
    my $configfile = shift || findConfig();
    if ( defined($configfile) ) {
        return loadProperties($configfile);
    }
    else {
        Log::Log4perl->get_logger(q{})->logcarp('Cannot find config file.');
    }
    return;
}

## Deprecated by CSA484, DomainMonitors now dynamically register themselves.
##** @function getHypervisorList( $configfile )
## @brief Get the list of hypervisor machines from the config file
##
## @param configfile the path to the config file or undef to use the default
## @return A list of hypervisors that can be used by this SWAMP instance
##*
#sub getHypervisorList0 {
#    my $configfile = shift;
#    my $config     = getSwampConfig($configfile);
#    return split( /\s+/sxm, $config->get('hypervisors') );
#}

#** @function getHostAndPort($token, $configfile )
# @brief Return the host and port associated with a pattern in the config file.
#
# @param token the prefix of the host/port pair in the config file. For example 'agentMonitor' would be the prefix for agentMonitorHost
# @param configfile the path to the config file or undef to use the default
# @return textual representations of (port, host)
# @see {@link getSwampConfig}
#*
sub getHostAndPort {
    my $token      = shift;
    my $configfile = shift;
    my $config     = getSwampConfig($configfile);
    return ( $config->get( $token . 'Port' ), $config->get( $token . 'Host' ) );
}

my %methodnames;

sub getMethodName {
    my $key = shift;

    # Only initialize map if we need to
    if ( !%methodnames ) {
        %methodnames = loadConfigMethodNames();
    }
    if ( !defined( $methodnames{$key} ) ) {
        Log::Log4perl->get_logger(q{})->logcarp("Cannot find method named $key.");
    }
    return $methodnames{$key};
}

#** @function createBOGfileName( $execrunid )
# @brief given a execute run it, convert it into a BOG
# filename
#
# @param execrunid - the execrunid of the BOG of interest.
# @return the BOG file's name.
# @see
#*
sub createBOGfileName {
    my $execrunid = shift;
    return "${execrunid}.bog";
}

sub getJobDir {
    my $execrunid = shift;
    $execrunid =~ s/ //gxsm;
    return "job.${execrunid}";
}

sub getJobFilename {
    my $execrunid = shift;
    $execrunid =~ s/ //gxsm;
    return File::Spec->catfile( getJobDir($execrunid), "${execrunid}.sub" );
}

#** @function getDomainStateFilename( $basedir, $domain)
# @brief Build a filename for a domain's statefile
#
# @param basedir This SWAMP instance's top level directory (above {bin,run,log})
# @param domain The domain of interest.
# @return the absolute path to the `domain`'s state file name.
#*
sub getDomainStateFilename {
    my $basedir = shift;
    my $domain  = shift;
    return File::Spec->catfile( abs_path($basedir), 'run', "$domain.state" );
}

sub getLoggingConfigString {

    # Load from the config file, if we
    # can find it.
    my $configfile = findConfig();
    if ( defined($configfile) ) {
        return abs_path($configfile);
    }

    # ToDo Move this into the config file
    my $config = <<"LOGGING_CONFIG";
    log4perl.logger          = TRACE, Logfile, Screen
    log4perl.appender.Logfile          = Log::Log4perl::Appender::File
    log4perl.appender.Logfile.filename = sub { logfilename(); };
    log4perl.appender.Logfile.mode = append
    log4perl.appender.Logfile.layout   = Log::Log4perl::Layout::PatternLayout
    log4perl.appender.Logfile.layout.ConversionPattern = %d: %p %P %F{1}-%L %m%n

    log4perl.appender.Screen         = Log::Log4perl::Appender::Screen
    log4perl.appender.Screen.stderr  = 0
    log4perl.appender.Screen.Threshold  = TRACE
    log4perl.appender.Screen.layout = Log::Log4perl::Layout::PatternLayout
    log4perl.appender.Screen.layout.ConversionPattern = %r %p %P %F{1} %M %L> %m %n
LOGGING_CONFIG

    #    log4perl.appender.Screen         = Log::Log4perl::Appender::ScreenColoredLevels
    return \$config;
}

sub getUUID {
    return Data::UUID->new()->create_str();
}

#** @method loadProperties( $file , \%hash)
# @brief Read a files of properties (key value pairs) into a hashmap
#
# @param file - the name of the property file to read
# @param hash - the hash reference to fill with properties from $file
# @return a ConfigReader::Simple object.
# @see {@link getSwampConfig}
#*
sub loadProperties {
    my $file    = shift;
    my $hashref = shift;
    my $config;
    Log::Log4perl->get_logger(q{})->debug("loadProperties: reading $file");
    $config = ConfigReader::Simple->new($file);

    if ( defined($hashref) && ref($hashref) eq "HASH" ) {
        my $nItems = 0;
        foreach my $key ( $config->directives() ) {
            $hashref->{$key} = $config->get($key);
            $nItems++;
        }
        return $nItems;
    }
    else {
        return $config;
    }
}

#** @function saveProperties( $file, \%hash, $comment )
# @brief Write the provided hash out to a property file
#
# @param file - the name of the property file to save to
# @param hash - the hash reference with which to fill the properties file.
# @param comment - Optional comment to add to the property file (program version,purpose)
# @return 1 on success, 0 on failure
# @see
#*
sub _getPropString { my ($key, $value) = @_ ;
	my $propstring = q{};
	my $nlcount = ($value =~ tr/\n//);
	if ($nlcount > 0) {
		$nlcount += 1;
		$propstring = "$key:${nlcount}L=$value";
	}
	elsif ($value =~ m/^\s+|\s+$/sxm) {
		$propstring = "$key:=$value";
	}
	else {
		$propstring = "$key=$value";
	}
	return $propstring;
}

sub saveProperties {
    my $file    = shift;
    my $hashref = shift;
    my $comment = shift;
    my $ret     = 0;
    if ( open( my $fh, '>', abs_path($file) ) ) {
        if ( defined($comment) ) {
            print $fh "# $comment\n";
        }
        foreach my $key ( sort keys %{$hashref} ) {
			my $propstring = _getPropString($key, $hashref->{$key});
            print $fh "$propstring\n";
        }
        if ( !close($fh) ) {
            Log::Log4perl->get_logger(q{})->warn("close failed on $file $OS_ERROR");
        }
        else {
            $ret = 1;
        }
    }
    else {
        Log::Log4perl->get_logger(q{})->error("unable to open $file $OS_ERROR");
    }
    return $ret;
}

#** @function systemcall( $command )
# @brief Run an external process and wait for it to finish
#
# @param $command the entire command line of the process to run
# @return the output (STDOUT and STDERR) of the process and process exit status. 0 => success.
#*
sub systemcall {
    my ($command) = @_;
    my $handler = $SIG{'CHLD'};
    local $SIG{'CHLD'} = 'DEFAULT';
    my ( $output, $status ) = ( $_ = qx{$command 2>&1}, $CHILD_ERROR >> 8 );
    local $SIG{'CHLD'} = $handler;

    if ($status) {
        my $msg = "$command failed with status $status";
        if ( defined($output) ) {
            $msg .= "($output)";
        }
        carp $msg;
    }
    return ( $output, $status );
}

sub condor_chirp { my ($prefix, $type, $title, $value) = @_ ;
	my $key = 'SWAMP';
	if (defined($prefix)) {
		$key .= "_$prefix";
	}
	else {
		$key .= "_ARUN";
	}
	if (defined($type)) {
		$key .= "_$type";
	}
	if (defined($title)) {
		$key .= "_$title";
	}
	if ($type eq 'ID') {
		$value = "\\\"$value\\\"";
	}
	my $command = "/usr/libexec/condor/condor_chirp set_job_attr $key \"$value\"";
    my ($output, $status) = systemcall($command);
	return($output, $status);
}

#** @function trim( @out )
# @brief remove leading and trailing whitespace from input
#
# @param out The data to be trimmed, a LIST or scalar
# @return trimmed version of input
#*
sub trim {
    my @out = @_;
    for (@out) {
        s/^\s+//sxm;
        s/\s+$//sxm;
    }
    return wantarray ? @out : $out[0];
}

#** @function safecsvstring( )
# @brief Convert a list of values into a comma separated string, allowing for undefined values as well
#
# @return comma separated string of the input values in original order with '<?>' as a placeholder for undefined values
#*
sub safecsvstring {
    return join q{,}, map { !defined $_ ? q{<?>} : $_ } @_;
}

#** @function uname( )
# @brief Get the current operating system's name.
#
# @return The name of the current operating system or `unknown` if the name cannot be obtained.
#*
sub uname {
    my ( $output, $status ) = systemcall("uname -s");
    if ($status) {
        return "unknown";
    }
    else {
        chomp $output;
        return $output;
    }
}

#** @function findConfig( )
# @brief Locate the SWAMP configuration file (swamp.conf)
#
# Search order:
# - location pointed to by the environment variable SWAMP_CONFIG
# - current directory
# - The etc/swamp.conf file relative to where this process is running
# - /opt/swamp/etc/conf the default install location in production environments
# - ../../deployment/swamp/config/swamp.conf subversion location relative to this package
#
# @return The location of the swamp.conf file or undef if the file cannot be found in one of the usual locations.
# @see
#*
sub findConfig {
    if ( defined( $ENV{'SWAMP_CONFIG'} ) ) {
        return $ENV{'SWAMP_CONFIG'};
    }
    elsif ( -r 'swamp.conf' ) {
        return 'swamp.conf';
    }
    elsif ( SWAMP::SWAMPUtils->DEFAULT_CONFIG && -r SWAMP::SWAMPUtils->DEFAULT_CONFIG ) {
        return SWAMP::SWAMPUtils->DEFAULT_CONFIG;
    }
    elsif ( -r '/opt/swamp/etc/swamp.conf' ) {
        return '/opt/swamp/etc/swamp.conf';
    }
    elsif ( -r '../../deployment/swamp/config/swamp.conf' ) {
        return '../../deployment/swamp/config/swamp.conf';
    }
    return;
}

sub loadConfigMethodNames {
    my $config = getSwampConfig();
    if ( !defined($config) ) {

        Log::Log4perl->get_logger(q{})->logconfess("cannot get config ");
    }
    my %methods;
    foreach my $key ( $config->directives() ) {
        if ( $key =~ /^method\./sxm ) {
            my $method = $config->get($key);
            $key =~ s/^method\.//sxm;
            $methods{$key} = $method;
        }
    }
    return %methods;
}

#** @function checksumFile( $filename, $algorithm)
# @brief Compute the checksum (sha512 default) of a file.
#
# @param filename The path of a file on which to compute the checksum.
# @param algorithm The digest algorithm to use: 1, 224, 256, 384, 512, 512224, or 512256. 512 is the default.
# @return the digest value as a hexadecimal string -or- ERROR if the digest could not be computed.
#*
sub checksumFile {
    my $filename  = shift;
    my $algorithm = shift || 512;
    my $sha       = Digest::SHA->new(512);
    if ( defined( eval { $sha->addfile( $filename, "pb" ); } ) ) {
        return $sha->hexdigest;
    }
    else {
        return 'ERROR';
    }
}

#** @function getHostname( $ipstr )
# @brief Wrapper for gethostbyaddr: from an ipaddress string resolve the name.
#
# @param ipstr - A string representing an IPv4 address (e.g. '127.0.0.1')
# @return the hostname on success, undef on failure
#*
sub getHostname {
    my $ipstr = shift;
    return scalar gethostbyaddr( inet_aton($ipstr), AF_INET );
}

sub getHostIP {
    my $hostname = shift;
    my $ip;
    my $ok = eval { $ip = inet_ntoa( scalar gethostbyname( $hostname ) ); };
    if (defined($ok)) {
        return $ip;
    }
    return ;
}

# Fork and start the process in @_
sub start_process {
    my $server = shift;
    my $pid;
    if ( $OSNAME eq "MSWin32" ) {
        Log::Log4perl->get_logger(q{})->warn("About to call fork() on a Win32 system.");
    }
    if ( !defined( $pid = fork() ) ) {
        Log::Log4perl->get_logger(q{})->warn("Unable to fork process $server: $OS_ERROR");
        return;
    }
    elsif ($pid) {
        return $pid;
    }
    else {
        exec($server);    # Need a better way to tell if this failed.
                          # If we return from the exec call, bad bad things have happened.
        exit 6;
    }
    return;
}

# Stop process PID passed in @_
sub stop_process {
    my $pid = shift;

    # Per RT 27778, use 'KILL' instead of 'INT' as the stop-server signal for
    # MSWin platforms:
    my $SIGNAL = ( $OSNAME eq "MSWin32" ) ? 'KILL' : 'TERM';
    my $ret = kill $SIGNAL, $pid;
    sleep 1;    # give any old sockets time to go away
    if ($ret != 1) {
        Log::Log4perl->get_logger(q{})->warn("kill of $pid failed, trying again");
        $ret = kill $SIGNAL, $pid;
        sleep 1;    # give any old sockets time to go away
        if ($ret != 1) {
            Log::Log4perl->get_logger(q{})->warn("kill of $pid failed again, -9 time.");
            $ret = kill -9, $pid;
        }
    }
    return $ret;
}

sub createhtaccess {
    my $webroot   = shift;
    my $projuuid  = shift;
    my $viewerip  = shift;
    my $authtoken = shift;
    my $ret       = 1;
    my $errormsg;
    my $htfolder = File::Spec->catfile( $webroot, $projuuid );

    # Clean up any existing one
    removehtaccess( $webroot, $projuuid );

    make_path( $htfolder, { 'error' => \my $err } );
    if ( @{$err} ) {
        $ret = 0;
        foreach my $item ( @{$err} ) {
            my ( $file, $message ) = %{$item};
            $errormsg .= "$file $message, ";
        }
    }
    if ( sysopen my $fh, File::Spec->catfile( $htfolder, '.htaccess' ),
        O_WRONLY | O_EXCL | O_CREAT )
    {
        print $fh qq{#<IfModule mod_rewrite.c>\n};
        print $fh qq{# Ensure mod_rewrite engine is turned on\n};
        print $fh qq{RewriteEngine on\n};
        print $fh qq{# Set the custom header for allowing access to the project\n};
        print $fh qq{RequestHeader set AUTHORIZATION "SWAMP $authtoken"\n};
        print $fh qq{# Handle proxy rewrite of URL\n};
        print $fh qq{RewriteRule ^/?(.*) https://$viewerip/$projuuid/\$1 [P]\n};
        print $fh qq{#</IfModule>\n};

        if ( !close($fh) ) {

        }
    }
    else {
        $ret = 0;
        $errormsg .= "Cannot open $htfolder/.htaccess $OS_ERROR";
    }
    return ( $errormsg, $ret );
}

sub removehtaccess {
    my $webroot  = shift;
    my $projuuid = shift;
    my $ret      = 1;
    my $errormsg;
    if (!defined($projuuid) || length($projuuid) < 3) {
        return ('no subfolder', 0);
    }

    remove_tree( File::Spec->catfile( $webroot, $projuuid ), { 'error' => \my $err } );
    if ( @{$err} ) {
        $ret = 0;
        foreach my $item ( @{$err} ) {
            my ( $file, $message ) = %{$item};
            $errormsg .= "$file $message, ";
        }
    }
    return ( $errormsg, $ret );
}

sub makezip {
    my $oldname = shift;
    my $log     = Log::Log4perl->get_logger(q{});
    my $newname = basename($oldname);
    my $output;
    my $status;
    my $tmpdir = "tmp$PID";    #original
    mkdir $tmpdir;
    chdir $tmpdir;

    if ( $newname =~ /(\.tar)/isxm || $newname =~ /(\.tgz)/isxm ) {
        $newname =~ s/$1.*$/.zip/sxm;

        # This will extract normal and compressed tarballs
        ( $output, $status ) = systemcall("/bin/tar xf $oldname");
        if ($status) {
            $log->error(
                "Unable to extract tarfile $oldname: ($status) " . defined($output)
                ? $output
                : q{}
            );
            $newname = $oldname;
        }
    }
    elsif ( $newname =~ /(\.jar$)/isxm ) {
        $newname =~ s/$1.*$/.zip/sxm;
        ( $output, $status ) = system("jar xf $oldname");
        if ($status) {
            $log->error(
                "Unable to extract jarfile $oldname: ($status) " . defined($output)
                ? $output
                : q{}
            );
            $newname = $oldname;
        }
    }
    else {
        $log->error("Do not understand how to re-zip $oldname");

    }
    if ( $newname ne $oldname ) {
        ( $output, $status ) = systemcall("zip ../$newname -qr .");
        if ($status) {
            $log->error(
                "Unable to create zipfile ../$newname ($status) " . defined($output)
                ? $output
                : q{}
            );

            # revert
            $newname = $oldname;
        }
    }
    chdir q{..};
    remove_tree($tmpdir);
    return $newname;
}

sub pid_extension {
    return 'did';
}
sub makePIDFilename {
    my $pid = shift;
    my $domain = shift;
    return "${domain}_${pid}." . pid_extension();
}
sub readDomainPIDFile {
    my $file = shift;
    my $pid;
    my $domain;
    if (open (my $fh, '<', abs_path($file) ) ) {
        while (<$fh>) {
            next if (/^\#/sxm);
            chomp;
            ($pid, $domain) = split(/=/sxm, $_);
        }
        if (!close($fh)) {
            my $log     = Log::Log4perl->get_logger(q{});
            $log->warn("readDomainPIDFile: Cannot close <$file> $OS_ERROR");
        }
    }
    else {
        my $log     = Log::Log4perl->get_logger(q{});
        $log->error("readDomainPIDFile: Cannot open <$file> $OS_ERROR");
    }
    return ($pid, $domain);
}
sub createDomainPIDFile {
    my $pid = shift;
    my $domain = shift;
    my $file = File::Spec->catfile( getSWAMPDir(), 'run', makePIDFilename($pid, $domain));
    my $ret = 0;
    if ( open (my $fh, '>', $file) ) {
        print $fh "$pid=$domain\n";
        if (!close($fh)) {
            my $log     = Log::Log4perl->get_logger(q{});
            $log->warn("createDomainPIDFile: Cannot close <$file> $OS_ERROR");
        }
        $ret = 1;
    }
    else {
        my $log     = Log::Log4perl->get_logger(q{});
        $log->error("createDomainPIDFile: Cannot open <$file> $OS_ERROR");
    }
    return $ret;
}
sub removeDomainPIDFile {
    my $pid = shift;
    my $domain = shift;
    my $file = File::Spec->catfile( getSWAMPDir(), 'run', makePIDFilename($pid, $domain));
    my $ret = 0;
    if (unlink ($file)) {
        $ret = 1;
    }
    return $ret;
}

#** @function makeoption( $param, $name)
# @brief Convert a parameter into an option or set to blank. This is useful when mapping one set of parameter to a program's options
#
# @param param The parameter to use as the option parameter or empty/undefined
# @param name  The option name to build
# @return either '--$name $param' or empty string, either of which should be valid syntax.
#*
sub makeoption {
    my $param = shift;
    my $name = shift;
    if (defined($param) && $param ne q{}) {
        return "--$name $param";
    }
    return q{};
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
