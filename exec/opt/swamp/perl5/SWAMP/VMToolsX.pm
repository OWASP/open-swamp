package SWAMP::VMToolsX;

use 5.010;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

BEGIN {
    our $VERSION = '1.54';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(checkEffectiveUser consoleMsg errorMsg extractOutput init logMsg pkgshutdown
      startVM
      defineVM
      destroyVM
      removeVM
      listMasters
      listVMs
      initProjectLog
      createInputDisk
      createDeltaDisk
      createOutputDisk
      createImages
      createXML
      vmVNCDisplay
      vmExists
      vmState);
}

use English '-no_match_vars';
use XML::Simple;
use File::Basename qw(basename);
use Sys::Syslog qw(syslog openlog closelog);
use Carp qw(croak carp);
use Log::Log4perl;

my $VIRSH        = '/usr/bin/virsh';
my $QEMUIMG      = '/usr/bin/qemu-img';
my $MAKEFS       = '/usr/bin/virt-make-fs';
my $GUESTFISH    = '/usr/bin/guestfish';
my $SHRED        = '/usr/bin/shred';
my $TEMPLATE_VM  = '/usr/local/etc/swamp/templ.xml';
my $SYSTEMPREFIX = q{};

use constant 'ONEK' => 1024;
my $MASTER_IMAGE_FOLDER = '/var/lib/libvirt/images';
my $PROJECT_FOLDER      = '/swamp/working/project';
my $EMPTY               = '/usr/local/empty';
my @projectlog;
my $loggingOn     = 0;
my $origusername  = 'unknown';
my $vmlogfilename = q{};

my %os_init = (
    'rhel-6'     => \&handleRHEL6,
    'centos'     => \&handleRHEL6,
    'ubuntu'     => \&handleUbuntu,
    'debian'     => \&handleDebian,
    'fedora'     => \&handleFedora,
    'scientific' => \&handleScientific,
    'windows-7'  => \&handleWindows,
);

# Log a message to syslog and our log

sub logMsg {
    my ($message) = @_;
    if ( !$loggingOn ) {    # this is a programmer error
        carp 'Logging hasn\'t been started. Did init get called?';
        return;
    }
    syslog( 'info', $message );
    my $now = scalar localtime;
    if ( $loggingOn > 1 ) {
        if ( open my $logfh, '>>', $vmlogfilename ) {
            print $logfh "$now: $message\n";
            close $logfh or croak "Cannot close log file $OS_ERROR";
        }
    }
    else {
        push @projectlog, "$now: $message";
    }
    return;
}

sub consoleMsg {
    my ($message) = @_;
    print {*STDOUT} "$message\n";
    logMsg($message);
    return;
}

sub errorMsg {
    my ($message) = @_;
    print {*STDERR} "$message\n";
    logMsg($message);
    return;
}

sub systemcall {
    my ($command) = @_;
    my ( $output, $status ) = ( $_ = qx{$SYSTEMPREFIX $command 2>&1}, $CHILD_ERROR >> 8 );
    logMsg("system: $command returned $output");
    carp "$command failed with status $status\n" if ($status);
    return ( $output, $status );
}

# -----------------------------------------------------------------------------
# Initialize logging and any other package items
# @param vmname the vm for which we are running
# @ident The identity used in syslog calls
# -----------------------------------------------------------------------------
sub init {
    my ( $vmname, $ident, $syslogOnly ) = $_;
    openlog( $ident, 'pid, ndelay' );
    ++$loggingOn;
    if ( !$syslogOnly ) {
        initProjectLog($vmname);
    }
    else {    #init backing store for project log.
        @projectlog = ();
    }
    return;
}

sub setVMLogFilename {
    my ($vmname) = @_;
    $vmlogfilename = getVMDir($vmname) . '/messages.log';
    return $vmlogfilename;
}

sub initProjectLog {
    my ($vmname) = @_;
    mkdir( getVMDir($vmname) );
    if ( open my $logfh, '>>', setVMLogFilename($vmname) ) {

        # dump any logging so far.
        foreach (@projectlog) {
            print $logfh "$_\n";
        }
        close $logfh or errorMsg("Cannot close log file $ERRNO");
        ++$loggingOn;
        @projectlog = ();
    }
    else {
        errorMsg("Could not open project log file $ERRNO");
    }
    return;
}

# shut down this package. Close log files.
sub pkgshutdown {
    closelog();
    return;
}

sub isMasterImage {
    my ($name) = @_;
    my $ret = 0;
    if ( $name =~ /^condor.*-master-\d+.qcow2/mxs ) {
        $ret = 1;
    }
    return $ret;
}

sub displaynameToMastername {
    my ($name) = @_;
    opendir( my $dir, $MASTER_IMAGE_FOLDER )
      or croak "Cannot opendir $MASTER_IMAGE_FOLDER $ERRNO";
    my @files = readdir($dir);
    closedir($dir);
    my $maxImage = 0;
    foreach (@files) {
        next if ( $_ eq qq{.} || $_ eq qq{..} );
        if ( isMasterImage($_) && $_ =~ /$name/mxs ) {
            $_ =~ s/^.*master-//mxs;
            $_ =~ s/.qcow2$//mxs;
            if ( $_ > $maxImage ) {
                $maxImage = $_;
            }
        }
    }
    if ( $maxImage > 0 ) {
        return "condor-${name}-master-${maxImage}.qcow2";
    }
    return;
}

sub masternameToDisplayname {
    my ($name) = @_;
    $name =~ s/^condor-(.*)-master-\d+.qcow2/$1/mxs;
    return $name;
}

# Full master names are of the form 'condor-distro-master-YYYYMMDD.qcow2
# condor-fedora-18.0-64-master-2013060301.qcow2
sub listMasters {
    my @list;
    if ( -d $MASTER_IMAGE_FOLDER ) {
        opendir( my $dir, $MASTER_IMAGE_FOLDER );
        my @files = readdir $dir;
        closedir $dir;
        my %masters;
        foreach (@files) {
            if ( isMasterImage($_) ) {
                my $name = masternameToDisplayname($_);
                $masters{$name} = 1;
            }
        }
        foreach ( keys %masters ) {
            push @list, $_;
        }
    }
    return @list;
}

sub vmVNCDisplay {
    my ($vmname) = @_;
    my ( $output, $status ) = systemcall("$VIRSH vncdisplay $vmname");
    if ($status) {
        errorMsg("Unable to get vncdisplay : Error reported is: $output");
        return 1;
    }
    else {
        print "$output";
    }
    return 0;
}

# Return 1 if VM exists, 0 otherwise
sub vmExists {
    my ($vmname) = @_;
    my ( $output, $status ) = systemcall("$VIRSH list --all --name");
    if ($status) {
        errorMsg("Unable to get list of VMs: Error reported is: $output");
        return 0;
    }
    my @vms = split( /\n/mxs, $output );
    foreach (@vms) {
        chomp;
        if ( $_ eq $vmname ) {
            return 1;
        }
    }
    return 0;
}

sub vmState {
    my ($vmname) = @_;
    my ( $output, $status ) = systemcall("$VIRSH domstate $vmname");
    if ( !$status ) {
        chomp $output;
        chomp $output;
        return $output;
    }
    else {
        errorMsg("Unable to get VM state: $output");
        return "undefined";
    }
}

# Start a VM
sub startVM {
    my ($vmname) = @_;
    my $ret = 1;
    if ( vmExists($vmname) ) {
        my $state = vmState($vmname);

        # NB: A state table could simplify this code
        if ( $state eq "shut off" ) {
            my ( $output, $status ) = systemcall("$VIRSH start $vmname");
            if ($status) {
                errorMsg("VM '$vmname' cannot be started. Error reported is : '$output'");
            }
            else {
                # Make a symlink to the vm log
                my $dir = getVMDir($vmname);
                if ( !-r "$dir/${vmname}.log" ) {
                    systemcall("/bin/ln -s /var/log/libvirt/qemu/${vmname}.log $dir/${vmname}.log");
                }
                $ret = 0;
            }
        }    # are these ALL the states reported by domstate?
        elsif ( $state eq "paused" ) {
            errorMsg("VM '$vmname' is currently running but suspended.");
        }
        elsif ( $state eq "in shutdown" ) {
            errorMsg("VM '$vmname' is currently shutting down.");
        }
        elsif ( $state eq "running" ) {
            errorMsg("VM '$vmname' is already started.");
        }
        else {
            errorMsg("VM '$vmname' unknown state [$state]");
        }
    }
    else {
        errorMsg("Cannot find a VM named '$vmname'");
    }
    return $ret;
}

sub getVMDir {
    my ($vmname) = @_;
    if ( defined $vmname ) {
        return "${PROJECT_FOLDER}/${vmname}";
    }
    else {
        return "${PROJECT_FOLDER}";
    }
}

sub extractOutput {
    my ( $dirpath, $vmname ) = @_;
    if ( !-d $dirpath ) {
        errorMsg("$dirpath does not exist.");
        return 1;
    }
    my $vmdir = "${PROJECT_FOLDER}/${vmname}";
    open( my $script, '>', "$vmdir/gfout.sh" )
      or croak "Cannot create guestfish script $ERRNO";
    print $script "add $vmdir/outputdisk.qcow2\n";
    print $script "run\n";
    print $script "mount /dev/sda /\n";
    print $script "glob copy-out /* $dirpath\n";
    close $script or errorMsg("Cannot close guestfish script $OS_ERROR");
    my ( $output, $status ) = systemcall("${GUESTFISH} -f $vmdir/gfout.sh");

    if ($status) {
        errorMsg("output extraction failed: $output $status");
        return 1;
    }
    return 0;
}

sub handleRHEL6 {
    my ($opts)     = @_;
    my $osimage  = $opts->{'osimage'};
    my $script   = $opts->{'script'};
    my $runshcmd = $opts->{'runcmd'};
    my $vmname   = $opts->{'vmname'};
    my $ostype   = 'unknown';
    if ( $osimage =~ /rhel-6..-32/mxs ) {
        $ostype = 'RHEL6.4 32 bit';
    }
    elsif ( $osimage =~ /rhel-6..-64/mxs || $osimage =~ /centos/mxs ) {
        $ostype = 'RHEL6.4 64 bit';
    }
    print $script "write /etc/sysconfig/network \"HOSTNAME=$vmname\\nNETWORKING=yes\\n\"\n";
    print $script
"write /etc/sysconfig/network-scripts/ifcfg-eth0 \"DHCP_HOSTNAME=`hostname -s`\\nBOOTPROTO=dhcp\\nONBOOT=yes\\nDEVICE=eth0\\nTYPE=Ethernet\\n\"\n";
    print $script "rm-rf /etc/udev/rules.d/70-persistent-net.rules\n";
    print $script "write /etc/rc3.d/S99runsh $runshcmd\n";
    print $script "chmod 0777 /etc/rc3.d/S99runsh\n";
    return $ostype;
}

sub handleDebian {
    my ($opts)     = @_;
    my $osimage  = $opts->{'osimage'};
    my $script   = $opts->{'script'};
    my $runshcmd = $opts->{'runcmd'};
    my $vmname   = $opts->{'vmname'};
    my $ostype   = 'Debian';

    # Debian hostname should not have FQDN
    print $script "write /etc/hostname \"${vmname}\\n\"\n";

    # Debian has the funky script order .files that need to be modified
    # so for now, just stuff this in rc.local
    print $script "write /etc/rc.local $runshcmd\n";
    return $ostype;
}

sub handleUbuntu {
    my ($opts)     = @_;
    my $osimage  = $opts->{'osimage'};
    my $script   = $opts->{'script'};
    my $runshcmd = $opts->{'runcmd'};
    my $vmname   = $opts->{'vmname'};
    my $ostype   = 'Ubuntu';

    #Ubuntu hostname should not have FQDN
    print $script "write /etc/hostname \"${vmname}\\n\"\n";
    print $script "write /etc/rc2.d/S99runsh $runshcmd\n";
    print $script "chmod 0777 /etc/rc2.d/S99runsh\n";
    return $ostype;
}

sub handleScientific {
    my ($opts)     = @_;
    my $osimage  = $opts->{'osimage'};
    my $script   = $opts->{'script'};
    my $runshcmd = $opts->{'runcmd'};
    my $vmname   = $opts->{'vmname'};
    my $ostype   = 'Scientific';
    if ( $osimage =~ /scientific-5/mxs ) {
        $ostype = 'Scientific 5.9';
    }
    elsif ( $osimage =~ /scientific-6/mxs ) {
        $ostype = 'Scientific 6.4';
    }
    print $script "write /etc/sysconfig/network \"HOSTNAME=$vmname\\nNETWORKING=yes\\n\"\n";
    print $script
"write /etc/sysconfig/network-scripts/ifcfg-eth0 \"DHCP_HOSTNAME=`hostname -s`\\nBOOTPROTO=dhcp\\nONBOOT=yes\\nDEVICE=eth0\\nTYPE=Ethernet\\n\"\n";
    print $script "rm-rf /etc/udev/rules.d/70-persistent-net.rules\n";
    print $script "write /etc/rc3.d/S99runsh $runshcmd\n";
    print $script "chmod 0777 /etc/rc3.d/S99runsh\n";

    return $ostype;
}

sub handleFedora {
    my ($opts)     = @_;
    my $osimage  = $opts->{'osimage'};
    my $script   = $opts->{'script'};
    my $runshcmd = $opts->{'runcmd'};
    my $vmname   = $opts->{'vmname'};
    my $ostype   = 'Fedora';
    print $script "write /etc/hostname \"${vmname}.vm.cosalab.org\\n\"\n";
    print $script "write /etc/rc.d/rc.local $runshcmd\n";
    print $script "chmod 0777 /etc/rc.d/rc.local\n";

    return $ostype;
}

sub handleWindows {
    return 'Windows7';
}
sub insertIntoInit {
    my $osimage   = shift;
    my $script    = shift;
    my $runshcmd  = shift;
    my $vmname    = shift;
    my $imagename = shift;
    my $ostype    = 'unknown';
    my $ret       = 1;
    foreach my $key ( keys %os_init ) {
        if ( lc $osimage =~ /$key/sxm ) {
            $ostype = $os_init{$key}->( { 'osimage' => $osimage, 'script'  => $script, 'runcmd'  => $runshcmd, 'vmname'  => $vmname });
            $ret = 0;
            last;
        }
    }
    if ($ret == 1) {
        errorMsg("Unrecognized image platform type using \"$imagename\"");
    }
    return ( $ostype, $ret );
}


sub createOutputDisk {
    return;
}

sub createDeltaDisk {
## Work in progress for CSA-285
###     my $imagename = shift;    # Platform string
###     $imagename = displaynameToMastername($imagename);
###     # TODO This needs to be a $config call to see where the files should live
###     my $vmdir  = "${PROJECT_FOLDER}/${vmname}";
###     my $ostype = 'unknown';
###     mkdir("$vmdir");
###     ( $output, $status ) = systemcall(
###         "$QEMUIMG create -b ${MASTER_IMAGE_FOLDER}/${imagename} -f qcow2 ${vmdir}/${vmname}.qcow2"
###     );
###     if ($status) {
###         #errorMsg("image creation failed: $output $status");
###         return 1;
###     }
###     # TODO Better handling
###     open( my $script, '>', "$vmdir/gf.sh" )
###       or croak "Cannot create guestfish script $ERRNO";
###     print $script "#!${GUESTFISH} -f\n";
### 
###     # Command to run run.sh from init scripts
###     my $runshcmd =
### "\"#!/bin/bash\\n/bin/chmod 01777 /mnt/out;. /etc/profile.d/vmrun.sh;/bin/chown 0:0 /mnt/out;/bin/chmod +x /mnt/in/run.sh && cd /mnt/in && nohup /mnt/in/run.sh&\\n\"";
### 
###     # NB: This logic should be table driven and from a config file, not
###     # hardcoded.
###     # Based on the OS, need to modify various files
###     my $osimage = $imagename;
###     $osimage =~ s/sysprep//msg;
###     $osimage =~ s/wkstn//msg;
###     if ( $osimage =~ /rhel-6/mxs ) {
###         if ( $osimage =~ /rhel-6..-32/mxs ) {
###             $ostype = 'RHEL6.4 32 bit';
###         }
###         elsif ( $osimage =~ /rhel-6..-64/mxs ) {
###             $ostype = 'RHEL6.4 64 bit';
###         }
###         print $script "write /etc/sysconfig/network \"HOSTNAME=$vmname\\nNETWORKING=yes\\n\"\n";
###         print $script
### "write /etc/sysconfig/network-scripts/ifcfg-eth0 \"DHCP_HOSTNAME=`hostname -s`\\nBOOTPROTO=dhcp\\nONBOOT=yes\\nDEVICE=eth0\\nTYPE=Ethernet\\n\"\n";
###         print $script "rm-rf /etc/udev/rules.d/70-persistent-net.rules\n";
###         print $script "write /etc/rc3.d/S99runsh $runshcmd\n";
###         print $script "chmod 0777 /etc/rc3.d/S99runsh\n";
###     }
###     elsif ( $osimage =~ /debian/mxs ) {
###         $ostype = 'Debian';
### 
###         # Debian hostname should not have FQDN
###         print $script "write /etc/hostname \"${vmname}\\n\"\n";
### 
###         # Debian has the funky script order .files that need to be modified
###         # so for now, just stuff this in rc.local
###         print $script "write /etc/rc.local $runshcmd\n";
###     }
###     elsif ( $osimage =~ /ubuntu/mxs ) {
###         $ostype = 'Ubuntu';
### 
###         #Ubuntu hostname should not have FQDN
###         print $script "write /etc/hostname \"${vmname}\\n\"\n";
###         print $script "write /etc/rc2.d/S99runsh $runshcmd\n";
###         print $script "chmod 0777 /etc/rc2.d/S99runsh\n";
###     }
###     elsif ( $osimage =~ /fedora/mxs ) {
###         $ostype = 'Fedora';
###         print $script "write /etc/hostname \"${vmname}.vm.cosalab.org\\n\"\n";
###         print $script "write /etc/rc.d/rc.local $runshcmd\n";
###         print $script "chmod 0777 /etc/rc.d/rc.local\n";
###     }
###     elsif ( $osimage =~ /scientific/mxs ) {
###         $ostype = 'Scientific';
###         if ( $osimage =~ /scientific-5/mxs ) {
###             $ostype = 'Scientific 5.9';
###         }
###         elsif ( $osimage =~ /scientific-6/mxs ) {
###             $ostype = 'Scientific 6.4';
###         }
###         print $script "write /etc/sysconfig/network \"HOSTNAME=$vmname\\nNETWORKING=yes\\n\"\n";
###         print $script
### "write /etc/sysconfig/network-scripts/ifcfg-eth0 \"DHCP_HOSTNAME=`hostname -s`\\nBOOTPROTO=dhcp\\nONBOOT=yes\\nDEVICE=eth0\\nTYPE=Ethernet\\n\"\n";
###         print $script "rm-rf /etc/udev/rules.d/70-persistent-net.rules\n";
###         print $script "write /etc/rc3.d/S99runsh $runshcmd\n";
###         print $script "chmod 0777 /etc/rc3.d/S99runsh\n";
###     }
###     else {
###         errorMsg("Unrecognized image platform type using \"$imagename\"");
###         return 1;
###     }
###     consoleMsg("Modifying base image : type detected $ostype");
###     print $script "\n";
###     close $script or croak "Cannot close guestfish script $OS_ERROR";
###     ( $output, $status ) =
###       systemcall("${GUESTFISH} -f $vmdir/gf.sh -a ${vmdir}/${vmname}.qcow2 -i");
###     if ($status) {
###         errorMsg("image modification failed: $output $status");
###         return 1;
###     }
    return;
}

sub createInputDisk {
    my ( $dirpath, $vmname ) = @_;
    if ( -d $dirpath ) {
        my $vmdir = getVMDir($vmname);
        my ( $output, $status ) =
          systemcall("$MAKEFS --type=ext3 --format=qcow2 $dirpath ${vmdir}/inputdisk.qcow2");
        if ($status) {
            errorMsg("input disk creation failed: $output");
            return 0;
        }
    }
    else {
        errorMsg("input disk folder '$dirpath' does not exist.");
        return 0;
    }
    return 1;
}

# If makeMaster is 1, imagename is expected to contain an path to a qcow2 image.
# If makeMaster is 0, imagename is a masterified image name.
sub createImages {
    my ( $dirpath, $vmname, $imagename, $outsize, $makeMaster ) = @_;

    my $output = q{};
    my $status = 0;
    my $vmdir  = "${PROJECT_FOLDER}/${vmname}";
    my $ostype = 'unknown';
    my $fstype = 'ext3';                          # default file system type
    mkdir("$vmdir");

    # If not a master image, use master as a backing file.
    if ( $makeMaster == 0 ) {
        $imagename = displaynameToMastername($imagename);
        consoleMsg("Creating base image for VM \"$vmname\"");
        ( $output, $status ) = systemcall(
"$QEMUIMG create -b ${MASTER_IMAGE_FOLDER}/${imagename} -f qcow2 ${vmdir}/${vmname}.qcow2"
        );
        if ($status) {
            errorMsg("image creation failed: $output $status");
            return 1;
        }
        open( my $script, '>', "$vmdir/gf.sh" )
          or croak "Cannot create guestfish script $ERRNO";
        print $script "#!${GUESTFISH} -f\n";

        # Command to run run.sh from init scripts
        my $runshcmd =
"\"#!/bin/bash\\n/bin/chmod 01777 /mnt/out;. /etc/profile.d/vmrun.sh;/bin/chown 0:0 /mnt/out;/bin/chmod +x /mnt/in/run.sh && cd /mnt/in && nohup /mnt/in/run.sh&\\n\"";

        # NB: This logic should be table driven and from a config file, not
        # hardcoded.
        # Based on the OS, need to modify various files
        my $osimage = $imagename;
        $osimage =~ s/sysprep//msg;
        $osimage =~ s/wkstn//msg;
        ( $ostype, $status ) = insertIntoInit( $osimage, $script, $runshcmd, $vmname, $imagename );
        if ( $status == 1 ) {    # error already emitted
            return $status;
        }
        consoleMsg("Modifying base image : type detected $ostype");

        # 8/19/2013 Adding files for Jeff G's manifest scripts to parse
        $imagename = basename($imagename);
        $imagename =~ s/\.qcow2$//sxm;
        print $script "write /etc/vm-master-name \"$imagename\\n\"\n";
        print $script "write /etc/vm-master-mode \"interactive\\n\"\n";

        print $script "\n";
        close $script or croak "Cannot close guestfish script $OS_ERROR";

        # if we are a Windows OS, don't run the guest fish script
        if ( $ostype !~ /Windows/mxs ) {
            ( $output, $status ) =
              systemcall("${GUESTFISH} -f $vmdir/gf.sh -a ${vmdir}/${vmname}.qcow2 -i </dev/null");
            if ($status) {
                errorMsg("image modification failed: $output $status");
                return 1;
            }
        }
    }
    else {
        # Handle the master image case.
        if ( $makeMaster == 1 ) {

            open( my $script, '>', "$vmdir/gf.sh" )
              or croak "Cannot create guestfish script $ERRNO";
            print $script "#!${GUESTFISH} -f\n";

            # 8/19/2013 Adding files for Jeff G's manifest scripts to parse
            my $name = basename($imagename);
            $name =~ s/\.qcow2$//sxm;
            print $script "write /etc/vm-master-name \"$name\\n\"\n";
            print $script "write /etc/vm-master-mode \"master\\n\"\n";
            print $script "\n";
            close $script or croak "Cannot close guestfish script $OS_ERROR";
            ( $output, $status ) = systemcall("${GUESTFISH} -f $vmdir/gf.sh -a $imagename -i </dev/null");

            if ($status) {
                errorMsg("image modification failed: $output $status");
                return 1;
            }
        }

    }

    if ( $ostype =~ /Windows/mxs ) {
        $fstype = 'vfat --partition=mbr';
    }

    if ( $makeMaster != 0 ) {
        consoleMsg("Creating input disk image");
        ( $output, $status ) = systemcall(

         #"$MAKEFS --type=ext3 --size=+${outsize}M --format=qcow2 ${EMPTY} ${vmdir}/inputdisk.qcow2"
"$MAKEFS --type=${fstype} --size=+${outsize}M --format=qcow2 ${EMPTY} ${vmdir}/inputdisk.qcow2"
        );
    }
    else {
        if ( -d $dirpath ) {
            consoleMsg("Creating input disk image");

            # It has been seen that virt-make-fs incorrectly estimates the size
            # of filesystems with .zip files in them. Pad by +10M.
            ( $output, $status ) = systemcall(

 #                "$MAKEFS --type=ext3 --size=+10M --format=qcow2 $dirpath ${vmdir}/inputdisk.qcow2"
"$MAKEFS --type=${fstype} --size=+10M --format=qcow2 $dirpath ${vmdir}/inputdisk.qcow2"
            );
            if ($status) {
                errorMsg("input disk creation failed: $output");
                return 1;
            }
        }
        else {
            errorMsg("input disk folder '$dirpath' does not exist.");
            return 1;
        }
    }

    consoleMsg("Creating output disk image");
    ( $output, $status ) = systemcall(

#        "$MAKEFS --type=ext3 --size=+${outsize}M --format=qcow2 ${EMPTY} ${vmdir}/outputdisk.qcow2"
"$MAKEFS --type=${fstype} --size=+${outsize}M --format=qcow2 ${EMPTY} ${vmdir}/outputdisk.qcow2"
    );
    if ($status) {
        errorMsg("output disk creation failed: $output");
        return 1;
    }
    return 0;
}

sub createXML {
    my ( $vmname, $nCPU, $memMB, $imagename, $makeMaster ) = @_;
    my $xs = XML::Simple->new( 'KeepRoot' => 1, 'ForceArray' => 1, 'NoSort' => 1 );
    if ( !-r $TEMPLATE_VM ) {
        errorMsg("Cannot read xml template $TEMPLATE_VM");
        return 1;
    }

    # Slurp in the XML template
    my $xmlref = $xs->XMLin($TEMPLATE_VM);
    $memMB *= ONEK;    # needs to be represented as KB
    $xmlref->{'domain'}[0]->{'name'}[0]                       = "$vmname";
    $xmlref->{'domain'}[0]->{'vcpu'}[0]->{'content'}          = "$nCPU";
    $xmlref->{'domain'}[0]->{'memory'}[0]->{'content'}        = "$memMB";
    $xmlref->{'domain'}[0]->{'currentMemory'}[0]->{'content'} = "$memMB";
    if ( defined( $xmlref->{'domain'}[0]->{'uuid'}[0] ) ) {
        undef $xmlref->{'domain'}[0]->{'uuid'}[0];
    }
    my $disks = $xmlref->{'domain'}[0]->{'devices'}[0]->{'disk'};
    my $vmdir = getVMDir($vmname);
    mkdir("$vmdir");
    my $baseimage;

    if ($makeMaster) {
        $baseimage = $imagename;
    }
    else {
        $baseimage = "${vmdir}/${vmname}.qcow2";
    }
    foreach my $disk ( @{$disks} ) {
        if ( $disk->{'target'}[0]->{'dev'} eq "sda" ) {
            $disk->{'source'}[0]->{'file'} = $baseimage;
        }
        elsif ( $disk->{'target'}[0]->{'dev'} eq "sdb" ) {
            $disk->{'source'}[0]->{'file'} = "${vmdir}/inputdisk.qcow2";
        }
        elsif ( $disk->{'target'}[0]->{'dev'} eq "sdc" ) {
            $disk->{'source'}[0]->{'file'} = "${vmdir}/outputdisk.qcow2";
        }
    }
    my $xmlout = $xs->XMLout($xmlref);
    if ( open( my $out, '>', "$vmdir/${vmname}.xml" ) ) {
        print $out $xmlout;
        close $out or croak "Cannot write to VM XML file $OS_ERROR";
        return 0;
    }
    else {
        errorMsg("Cannot create XML $ERRNO");
        return 1;
    }
}

sub destroyVM {
    my ($vmname) = @_;
    my ( $output, $status ) = systemcall("$VIRSH destroy $vmname");
    if ($status) {
        errorMsg("Unable to undefine $vmname: $output");
        return 1;
    }
    return 0;
}

sub removeVM {
    my ($vmname) = @_;
    my ( $output, $status ) = systemcall("$VIRSH undefine $vmname");
    if ($status) {
        errorMsg("Unable to undefine $vmname: $output");
        return 1;
    }

    # Got here, ok to shred files and folder.
    my $folder = getVMDir($vmname);
    opendir( my $dir, $folder )
      or croak "Cannot find vm folder $folder $ERRNO\n";
    my @files = readdir($dir);
    closedir($dir);
    foreach (@files) {
        my $name = "$folder/$_";
        if ( -f $name ) {
            if ( -l $name ) {    # Do not shred symlinks, just remove.
                unlink($name);
            }
            else {
                ( $output, $status ) = systemcall("$SHRED -u $name");
            }
            if ($status) {
                errorMsg("Unable to remove $name : $output");
                return 1;
            }
        }
    }
    rmdir $folder;
    return 0;
}

sub defineVM {
    my ($vmname) = @_;
    my $dir = getVMDir($vmname);
    my ( $output, $status ) = systemcall("$VIRSH define ${dir}/${vmname}.xml");
    my $ret = 0;
    if ( !$status ) {
        if ( open( my $id, '>', "${dir}/.creator" ) ) {
            print $id "$origusername\n";
            close $id or errorMsg("Cannot close .creator file $OS_ERROR");
        }
    }
    else {
        errorMsg("Unable to define VM : $output");
        $ret = 1;
    }
    return $ret;
}

sub listVMs {
    my $id = "unknown";
    if ( defined( $ENV{'SUDO_USER'} ) ) {
        $id = $ENV{'SUDO_USER'};
    }
    my @vms;
    if ( opendir( my $dir, $PROJECT_FOLDER ) ) {
        my @dirs = readdir $dir;
        closedir $dir;
        foreach (@dirs) {
            my $file = "$PROJECT_FOLDER/$_/.creator";
            if ( -r "$file" ) {
                if ( open( my $fh, '<', "$file" ) ) {
                    my $creatorID = <$fh>;
                    close $fh
                      or errorMsg("Cannot close .creator file $OS_ERROR");
                    chomp $creatorID;
                    if ( $creatorID eq $id ) {
                        push @vms, $_;
                    }
                }
            }
        }
    }
    else {
        print {*STDERR} "Cannot read project folder.";
        return ();
    }
    return @vms;
}

# return 1 if OK to proceed, 0 otherwise
sub checkEffectiveUser {
    if ( defined( $ENV{'SUDO_USER'} ) ) {
        $origusername = $ENV{'SUDO_USER'};
    }
    my $username = getpwuid($EUID);
    if ( $username ne "root" ) {
        return 0;
    }
    return 1;
}

sub enableTestMode {
    $SYSTEMPREFIX = 'echo';

    mkdir $PROJECT_FOLDER;
    return;
}
1;
__END__

=pod

=encoding utf8

=head1 NAME

VMToolsX - methods for creation and manipulating VMs 

=head1 SYNOPSIS

  use VMTools qw(init vmExists startVM pkgshutdown);

  my $vmname="rhel6VM1";
  init($vmname, "logging identity");

  if (vmExists($vmname)) {
    startVM($vmname);
  }

  pkgshutdown();

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

