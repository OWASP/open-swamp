#** @file VRun.pm
#
# @brief This package contains the testable methods used by vrunTask.pl
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 12/23/2013 14:27:58
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::VRunTools;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

BEGIN {
    our $VERSION = '1.00';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
        createrunscript 
        copyvruninputs
        getUserDBVersion
        parseRunOut
    );
}

use Cwd qw(abs_path);
use English '-no_match_vars';
use File::Copy qw(move cp);
use File::Path qw(make_path remove_tree);
use Carp qw(croak carp);
use Log::Log4perl;
use Log::Log4perl::Level;
use SWAMP::SWAMPUtils qw(trim systemcall getSWAMPDir);

#** @function createrunscript( \%bogref, $dest, $timeout )
# @brief Create the run.sh script and ancillary scripts for this viewer VM
#
# @param bogref Reference to the Bill Of Goods hash 
# @param dest Name of the folder in which to create run.sh
# @param timeout Number of seconds of idle time before this VM shuts itself down
# @return 1 on success, 0 on failure
#*
sub createrunscript {
    my $bogref = shift;
    my $dest   = shift;    # 'input'
    my $timeout = shift; # Age of idle VM before self-terminating.
    my $ret    = 1;
    if ( open( my $fd, '>', abs_path("${dest}/run.sh") ) ) {
        print $fd <<"EOF";
RUNOUT=/mnt/out/run.out
cd /mnt/in
ip -4 -o address show dev eth0  | awk '{print \$4}' | sed -e's/\\/.*\$/ '`hostname`'/'  >> /etc/hosts
ping -c 3 `hostname`
if [ \$? != 0 ]
then
    echo ERROR: NO IP ADDRESS >> \$RUNOUT
    shutdown -h now
fi

chmod +x /mnt/in/checktimeout
echo "*/10 * * * * root /mnt/in/checktimeout" >> /etc/crontab

if [ -r viewerdb.tar.gz ]
then
    tar -C /var/lib/mysql -xvf viewerdb.tar.gz
fi
# Is there an upgrade available?
if [ -r codedx.war ]
then
    cp -f codedx.war /var/lib/tomcat6/webapps
    chown tomcat /var/lib/tomcat6/webapps/codedx.war
fi
chown -R mysql:mysql /var/lib/mysql/*
sed -i -e'/\\[mysqld\\]/c[mysqld]\\nlower_case_table_names=2' /etc/my.cnf.d/server.cnf 
service mysql start >> \$RUNOUT 2>&1
PROJ=$bogref->{'urluuid'}
# Code Dx v1.5+: Code Dx now takes API key in props file.
sed -i -e'/swa.admin.system-key/d' /var/lib/tomcat6/webapps/codedx/WEB-INF/classes/config/codedx.props
echo swa.admin.system-key=$bogref->{'apikey'} >> /var/lib/tomcat6/webapps/codedx/WEB-INF/classes/config/codedx.props

mkdir -p /var/lib/codedx/\$PROJ/config
mv /var/lib/tomcat6/webapps/codedx/WEB-INF/classes/config/codedx.props /var/lib/codedx/\$PROJ/config >> \$RUNOUT 2>&1
mv /var/lib/tomcat6/webapps/codedx/WEB-INF/classes/config/.installation /var/lib/codedx/\$PROJ/config >> \$RUNOUT 2>&1
if [ ! -r codedx.war ]
then
    # Point create out proxy location
    echo moving code dx to proxy \$PROJ >>  \$RUNOUT 2>&1
    mv /var/lib/tomcat6/webapps/codedx /var/lib/tomcat6/webapps/\$PROJ
else
    echo Removing Code Dx folder>>  \$RUNOUT 2>&1
    rm -rf /var/lib/tomcat6/webapps/codedx 
fi
chown -R tomcat:tomcat /var/lib/codedx >> \$RUNOUT 2>&1
sed -i "s/^codedx.appdata=.*\$/codedx.appdata=\\/var\\/lib\\/codedx\\/\$PROJ\\/config/" /etc/tomcat6/catalina.properties >>  \$RUNOUT 2>&1
/bin/rm -f /var/log/tomcat6/catalina.out
service tomcat6 start
#
# Block until CodeDX says it is ready to go.
# Its OK that this script might run forever, if the VM doesn't wake up in 5 mins, it will be
# reaped anyway.
grep -q '# The Server is now ready' /var/log/tomcat6/catalina.out
RET=\$?
while [ \$RET -ne 0 ]
do
    sleep 2
    grep -q '# The Server is now ready' /var/log/tomcat6/catalina.out
    RET=\$?
done
cat /var/log/tomcat6/catalina.out >>  \$RUNOUT 2>&1
ls -lart /var/lib/tomcat6/webapps >> \$RUNOUT 2>&1
if [ -r codedx.war ]
then
    # Now the new war file has been deployed, lets move codedx to our proxy location
    echo Shutting down Code Dx >> \$RUNOUT 
    service tomcat6 stop >> \$RUNOUT 2>&1
    mv /var/lib/tomcat6/webapps/codedx /var/lib/tomcat6/webapps/\$PROJ
    /bin/rm -f /var/log/tomcat6/catalina.out
    echo Starting Code Dx >> \$RUNOUT 
    service tomcat6 start >> \$RUNOUT 2>&1
    grep -q '# The Server is now ready' /var/log/tomcat6/catalina.out
    RET=\$?
    while [ \$RET -ne 0 ]
    do
        sleep 2
        grep -q '# The Server is now ready' /var/log/tomcat6/catalina.out
        RET=\$?
    done
fi
echo Code Dx is UP >> \$RUNOUT 
# Tell anyone listening our ipaddress
echo BEGIN ifconfig >> \$RUNOUT 2>&1
ip -o -4 address show dev eth0 >> \$RUNOUT 2>&1
echo END ifconfig >> \$RUNOUT 2>&1
EOF
        if (!close($fd)) {
            Log::Log4perl->get_logger(q{})->warn("Cannot close run.sh $OS_ERROR");
        }
    }
    else {
        Log::Log4perl->get_logger(q{})->error("Cannot open run.sh $OS_ERROR");
        $ret = 0;
    }
    if ( open( my $fd, '>', abs_path("${dest}/checktimeout") ) ) {
        print $fd "#!/bin/bash\n";
        print $fd "if [ \$(( `date +%s` - `stat -L --format %Y /var/log/tomcat6/catalina.out` )) -gt $timeout ] \n";
        print $fd "then\n";
        print $fd " /sbin/shutdown -h now\n";
        print $fd "fi\n";
        if (!close($fd)) {
            Log::Log4perl->get_logger(q{})->warn("Cannot close checktimeout.cnf $OS_ERROR");
        }
    }
    else {
        $ret = 0;
        Log::Log4perl->get_logger(q{})->error("Cannot open checktimeout $OS_ERROR");
    }

    return $ret;
}
sub copyvruninputs {
    my $bogref  = shift;
    my $dest    = shift;

    make_path( $dest, { 'error' => \my $err } );
    if ( @{$err} ) {
        for my $diag ( @{$err} ) {
            my ( $file, $message ) = %{$diag};
            if ( $file eq q{} ) {
                Log::Log4perl->get_logger(q{})->error("Cannot make input folder: $message" );
            }
            else {
                Log::Log4perl->get_logger(q{})->error("Cannot make input folder: $file $message" );
            }
        }
        return 0;
    }
    
    # set launch_platform to the current default platform value.
    $bogref->{'launch_platform'} = $bogref->{'platform'};

    # It is OK to not specify a db_path, this just means it has never been persisted
    if (defined($bogref->{'db_path'}) && length($bogref->{'db_path'}) > 2) {
        # Try and find a version file in the viewerdb tar file.
        my $userVersion = getUserDBVersion($bogref->{'db_path'});

        if ($userVersion ne $bogref->{'platform'}) {
            # set launch_platform to the previous default platform value.
            $bogref->{'launch_platform'} = $bogref->{'pred_platform'};
            Log::Log4perl->get_logger(q{})->info("Setting Code Dx platform to previous: $bogref->{'launch_platform'}");
            my $basedir = getSWAMPDir();
            my $file = abs_path("$basedir/thirdparty/codedx.war");
            if ( !cp( $file, $dest ) ) {
                Log::Log4perl->get_logger(q{})->error("Cannot copy $file to $dest $OS_ERROR" );
            }
        }

        if ( !cp( $bogref->{'db_path'}, $dest ) ) {
            # Error, but non-fatal.
            Log::Log4perl->get_logger(q{})->error("Cannot copy db_path to $dest $OS_ERROR" );
        }
    }
    
    return 1;
}
sub getUserDBVersion {
    my $dbpath = shift;
    my $fromVersion = q{codedx1.0.5-rhel-6.5-64-viewer}; # This is the oldest version in the field.
    my ($output, $status) = systemcall("tar tf $dbpath version_*");
    if (!$status) { # we found a version file
        chomp($output);
        $fromVersion = $output;
        $fromVersion =~ s/^version_//sxm;
    }
    return $fromVersion;
}

# TODO: Similar to parseRun
sub parseRunOut {
    my $bogref = shift;
    my $output = shift;
    my @lines    = split( /\n/sxm, $output );
    my %values;
    $values{'apikey'} = $bogref->{'apikey'};
    $values{'project'} = $bogref->{'project'};
    $values{'state'} = 'starting';
    my $inIF = 0;
    my $lastLine=q{};
    foreach (@lines) {
        if (/^BEGIN\sifconfig /sxm) {
            $inIF = 1;
            next;
        }
        if ($inIF) {
            if (/^END\sifconfig/sxm) {
                $inIF = 0;
                next;
            }
            else {
               $_=~s/^.*inet//xms;
               $_=~s/\/.*$//xms;
               $values{'ipaddr'} = trim($_);
               $values{'state'} = 'ready';
            }
        }
        $lastLine = $_;
    }
    return %values;
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
 

