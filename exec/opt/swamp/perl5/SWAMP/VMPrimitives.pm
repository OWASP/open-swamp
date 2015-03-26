#** @file VMPrimitives.pm
#
# @brief primitive operation interface between the SWAMP's virtual
# machine (VM) infrastructure, and users of the virtual machine infrastructure. The interface
# consist of seven primitive operations. These operations are described as functions along with
# their parameters, and return codes below. Together these operations provide an asynchronous
# interface to users of the SWAMP VM infrastructure to start, stop and manage VM where the user
# selects the OS platform to instantiate, provides an input directory to mount in the VM, and get the
# contents of an output directory mounted in the VM.
#
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 07/06/13
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
package SWAMP::VMPrimitives;

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
      configure
      isValidVmID
      vmGetOutputDir
      vmPutInputDir
      vmRegister
      vmStart
      vmStatus
      vmStop
      vmUnregister
    );
}

use English '-no_match_vars';
use XML::Simple;
use Sys::Syslog qw(syslog openlog closelog);
use Log::Log4perl;
use Carp qw(croak carp);

use SWAMP::VMToolsX qw(createInputDisk createDeltaDisk);

use SWAMP::RPCUtils qw(okReturn getReturnError);
use SWAMP::Client::AgentClient qw(queryVmID createVmID addVmID removeVmID );
use constant {
    'noError'     => 0,
    'accessError' => 1,
    'invalidDir'  => 2,
    'invalidVmId' => 4,
    'noSpace'     => 8,
    'noTransfer'  => 16,
    'notRunning'  => 32,
    'notStopped'  => 64,

    'hard' => 0,
    'soft' => 1,
};



#** @function configure( )
# @brief Configuration method for this package
#
# @param 
# @return nothing
#*
sub configure {
    my %opts=('testmode'=> 0, 
        @_);
    
    devMode($opts{'testmode'});
    return;    
}

#** @function devMode( $mode )
# @brief Its a setter, its a getter.
#
# @param mode optional parameter defining new devMode
# @return current mode. 0 implies production, > 0 implies a test mode.
#*
sub devMode {
    my $newMode = shift;
    state $opMode = 0;
    if (defined($newMode)) {
        $opMode = $newMode;
    }
    return $opMode;
}

#** @function vmRegister( $platformid, $outputDirSize, \%configref)
# @brief vmRegister adds a new VM to the system. The VM is not started at this point. If successful the
# sytem must persistently remember the vmId after any use in another primitive operation until
# released using #vmUnregister. All resources associated with vmId, may be reclaimed before the
# first use of vmId in another command. This is to allow the system to reclaim resources in the
# event that the client fails before recording the returned vmId.
#
# @param platformid Unique opaque identifier identifying the OS platform to start in the VM. A
# platformId must refer to exactly the same OS platform if used in multiple
# #vmRegister commands.
# @param outputDirSize The maximum size of the output directory in bytes.
# @param configref Additional optional configuration information, which may include, but is not
# limited to the following:
# amount of memory in the VM
# amount of disk space in noninput/
# output directories
# type of CPU
# number of CPUs
# custom firewall rules
# @return On success, returns a valid vmId  with errCode set to 
# `noError`. Also the executionStatus is stopped and the startCount is 0. On failures that can be immediately determined,
# errCode is set to a non-noError value, no VM is registered, and vmId is invalid.
# @see
#*
sub vmRegister {
    my $platformid    = shift;
    my $outputDirSize = shift;
    my $configref     = shift;
    my $vmid;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info('vmRegister');
        return ('xyz', $errCode);
    }

    # Get a new UUID for the VM
    $vmid = createVmID();
    my $res;
    if ( !defined($vmid) ) {
        Log::Log4perl->get_logger(q{})->warn('Error creating VmID');
        $errCode = SWAMP::VMPrimitives->invalidVmId;
    }
    else {
        $res = addVmID( $vmid, $configref->{'execrunid'}, $configref->{'hostname'} );
        if (!okReturn($res)) {
            Log::Log4perl->get_logger(q{})->warn("Error adding VmID to the system ".getReturnError($res));
            $errCode = SWAMP::VMPrimitives->invalidVmId;
        }
        $res = queryVmID($vmid);
        if (!okReturn($res)) {
            Log::Log4perl->get_logger(q{})->warn("Error querying ".getReturnError($res));
            $errCode = SWAMP::VMPrimitives->invalidVmId;
        }
        Log::Log4perl->get_logger(q{})->info("$vmid is bound to domain $res->{'domain'}");
        
        createDeltaDisk( $configref->{'hostname'}, $platformid );

        # Create the XML
        # Define the VM
        # Create the output disk
        # Create the delta file from the platform master

    }
    return ( $vmid, $errCode );
}

#** @function vmPutInputDir($vmId, $path )
# @brief Transfers the input directory of a stopped VM associated with vmId. This
# command may return before the directory is actually transferred. The contents of path must not
# be modified while the the path is associated with the input directory. On subsequent calls, the
# previous input directory is no longer associated with vmId.
# If the VM is not stopped, errCode is set to `notStopped` and no other action is performed. On
# success, the executionStatus is set to transferringInputDir while transferring and then stopped
# when the transfer is complete. Concurrent transfers of the input and output directories is allowed.
#
# @param vmId Unique opaque identifier returned by #vmRegister identifying the VM.
# @param path The path to a directory in the file system to copy the output directory
# inside of the virtual machine.
# @return errCode Contains the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `notStopped`
# - `accessError`
# - `noSpace`
# @see vmStatus
#*
sub vmPutInputDir {
    my $vmid = shift;
    my $path = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmPutInputDir:($vmid,  $path)");
        return $errCode;
    }

    # Need the vmname from ID
    my $ref = queryVmID($vmid);
    createInputDisk( $ref->{'domain'}, 'input' );
    return;
}

#** @function vmStopPutInputDir($vmid)
# @brief Stops a current transfer of the input directory of a stopped VM associated
# with vmId. This command may return before the transfer is actually stopped.
# If the output directory of th associated VM is not being transferred, errCode is set to `noTransfer`
# and no other action is performed. On success, the executionStatus is set to stopped when the
# transfer stops, and no input directory is associated with vmId.
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @return the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `noTransfer`
# @see vmStatus
#*
sub vmStopPutInputDir {
    my $vmid = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmStopPutInputDir:($vmid)");
        return $errCode;
    }
    return $errCode;
}

#** @function vmStart( $vmid, $interactive )
# @brief starts a previously registered VM associated with vmId. <p>This command may return
# before the VM is actually started. The first time it is called the VMs disk(s) are pristine copies of
# the platform image, the input directory is a readonly
# copy of the directory specified in the call to
# #vmPutInputDir, and the output directory is empty. On subsequent calls, any changes
# made to the disk state are persisted to the restarted VM.
# The interactive flags is used to specify if interactive access should be permitted from the
# external network. If set, appropriate modifications are made to allow such access. If not set, the
# firewall should not allow network connections from outside the internal network, but should allow
# connections that originate from the VM.
# An input directory must be associated with vmid before a VM may be started. If the input or
# output directory are being transferred, the VM will start when the transfers complete.
# On success, the executionStatus can be set to `waitingToStart` and then `running` when the VM is
# started, and the startCount is incremented by 1
#
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @param interactive A boolean value that determines if the virtual machine should have
# interactive access, i.e. open the firewall to allow incoming access to
# services running on interactive ports (ssh for now, but may be include
# other ports in the future or the platform).
# @return errCode Contains the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `noInputDirectory`
# - `notStopped`
# @see vmStatus.
#*
sub vmStart {
    my $vmid        = shift;
    my $interactive = shift // 0;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmStart($vmid, $interactive)");
        return $errCode;
    }

    return $errCode;
}

#** @function vmStatus( $vmid )
# @brief vmStatus returns information about the state of the VM associated with vmId. <p>The information is
# returned in the statusInfo structure (see above) and contains information about the state of the
# current VM, connection information to the VM, and resource usage counts. While a transfer of
# both the input and output directory are simultaneously occurring, the executionStatus is
# transferringOutput.
# If the vmid, was not returned from #vmRegister, or was used in #vmUnregister, the errCode is
# set to `invalidVmId`, otherwise the call succeeds.
#
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @return \%statusInfo A structure containing information about the status of the VM including
# information about the state of the VM, connection information, and usage
# statistics. $errorCode Contains the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# @see vmRegister
#*
sub vmStatus {
    my $vmid = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    my %status;
    if (devMode()) {
        state $status = 'waitingToStart';
        state $lastStatus = q{};
        if ($lastStatus eq 'waitingToStart') {
            $status = 'running';
        }
        elsif ($lastStatus eq 'running') {
            $status = 'waitingToStop';
        }
        elsif ($lastStatus eq 'waitingToStop') {
            $status = 'stopped';
        }
        Log::Log4perl->get_logger(q{})->info("vmStatus($vmid) = $status");
        $lastStatus = $status;
        $status{'executionstatus'} = $status;
    }
    return (\%status, $errCode);
}

#** @function vmStop($vmid, $how)
# @brief stops a currently running VM associated with vmid using the method specified by how.
# <p>This command may return before the VM is actually stopped. If the VM is not running, errCode is
# set to `notRunning`, and no other action is performed.
# On success, the executionStatus can be set to waitingToStop and then stopped when the VM is
# stopped.
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @param how An enumerated type describing how the VM infrastructure should cause
# the VM to shutdown. It is one of the following:
# - `soft` - request power off, equivalent to the power button being
# pressed on a real host
# - `hard` - stop immediately, equivalent to the power being removed
# from a real host
# @return The error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `notRunning`
# @see vmStatus
#*
sub vmStop {
    my $vmid = shift;
    my $how  = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmStop($vmid, $how)");
        return $errCode;
    }
    return $errCode;
}

#** @function vmGetOutputDir( $vmid, $path )
# @brief transfers the output directory of a stopped VM associated with vmId. <p>This
# command may return before the directory is actually transferred.
# If the VM is not stopped, errCode is set to `notStopped` and no other action is performed. On
# success, the executionStatus is set to `transferringOutputDir` while transferring and then `stopped`
# when the transfer is complete. Concurrent transfers of the input and output
# directories is allowed.
#
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @param path The path to a directory in the file system to copy the output directory
# inside of the virtual machine.
# @return the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `notStopped`
# - `noSpace`
# @see vmStatus
#*
sub vmGetOutputDir {
    my $vmid = shift;
    my $path = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmGetOutputDir($vmid, $path)");
        return $errCode;
    }

    return $errCode;
}

#** @function vmStopGetOutputDir( $vmid )
# @brief stops a current transfer of the output directory of a stopped VM associated
# with vmId. <p>This command may return before the transfer is actually stopped. The user is
# responsible to cleanup the partially transferred output directory.
# If the output directory of the associated VM is not being transferred, errCode is set to `noTransfer`
# and no other action is performed. On success, the executionStatus is set to `stopped` when the
# transfer stops.
#
# @param vmid Unique opaque identifier returned by #vmRegister identifying the VM.
# @return Contains the error type if an error occurred. This function can return the
# following errors:
# - `noError`
# - `invalidVmId`
# - `noTransfer`
# @see vmStatus
#*
sub vmStopGetOutputDir {
    my $vmid = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmStopGetOutputDir($vmid)");
        return $errCode;
    }
    return $errCode;
}

#** @function isValidVmID( $vmid )
# @brief
#
# @param vmid
# @return
# @see
#*
sub isValidVmID {
    my $vmid = shift;

    # ask Agent if the $vmid is known.
    my $res = queryVmID($vmid);
    if ( defined $res ) {
        return 1;
    }
    return 0;
}

#** @function vmUnregister($vmid)
# @brief vmUnregister removes the VM associated with vmId from the system.
# <p>
# This command may return before the VM is actually unregistered.
# If the VM is running, the VM is stopped as if #vmStop were
# called with how set to `hard`. If the VM is transferring the input directory, the transfer is
# stopped as if #vmStopPutInputDir were called. If the VM is transferring the output directory, the
# transfer is stopped as if #vmStopGetOutputDir were called. When the VM is unregistered, the
# system may reclaim any resources associated with the VM and vmId.
# On success, the executionStatus may be set to `waitingToUnregister` and when completely
# unregistered errCode is set to `invalidVmId` on all uses of vmId (see VmStatus).
# @param vmid - Unique opaque identifier returned by #vmRegister identifying the VM.
# @return errCode Contains the error type if an error occurred. This function can return the following errors:
# - `noError`
# - `invalidVmId`
#*
sub vmUnregister {
    my $vmid    = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmUnregister($vmid)");
        return $errCode;
    }

    # If VM is running, vmStop($vmid, hard)
    # Cleanup VM
    # remove VM from the Agent map.
    if ( isValidVmID($vmid) ) {

        # Shutdown the VM, if it's running
        vmStop( $vmid, SWAMP::VMPrimitives->hard );
        vmCleanup($vmid);
        if ( removeVmID(\$vmid) != 1 ) {
            # This is an error.
            Log::Log4perl->get_logger(q{})->error("removeVmID failed");
        }
    }
    else {
        $errCode = SWAMP::VMPrimitives->invalidVmId;
    }
    return $errCode;
}

#** @function vmCleanup($vmid)
# @brief vmCleanup removes all traces of $vmid from a hypervisor
# @param vmid - Unique opaque identifier returned by #vmRegister identifying the VM.
# @return errorCode contains the error type if an error occurred.
# - `noError`
# - `invalidVmId`
#*
sub vmCleanup {
    my $vmid = shift;
    my $errCode = SWAMP::VMPrimitives->noError;
    if (devMode()) {
        Log::Log4perl->get_logger(q{})->info("vmCleanup($vmid)");
        return $errCode;
    }
    return SWAMP::VMPrimitives->invalidVmId;
}


1;
__END__

=pod

=encoding utf8

=head1 NAME

VMPrimitives - methods for creation and manipulating VMs 

=head1 SYNOPSIS

=head1 DESCRIPTION

=cut
