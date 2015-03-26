package SWAMP::ToolLicense;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);
use JSON qw(to_json from_json);
use Log::Log4perl;

use SWAMP::SWAMPUtils qw(systemcall getSwampConfig);
use SWAMP::AssessmentTools qw(isParasoftTool);

BEGIN {
    our $VERSION = '0.01';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
		openLicense
		closeLicense
    );
}

sub fetch_switches { my ($floodlight_url) = @_ ;
	# Fetch the switch information
	my $address = "$floodlight_url/wm/core/controller/switches/json";
	my ($output, $status) = systemcall(qq{curl -q -s -X GET $address});
	if ($status) {
    	my $log = Log::Log4perl->get_logger(q{});
    	$log->error("Unable to acquire list of floodlight switches from $address: $status [$output]");
		return $status;
	}
	my $switches = from_json($output);
	return ($status, $switches);
}

sub fetch_flows { my ($floodlight_url) = @_ ;
    # Fetch all of the flows
    my $address = "$floodlight_url/wm/staticflowentrypusher/list/all/json";
    my ($output, $status) = systemcall(qq{curl -q -s -X GET $address});
	if ($status) {
    	my $log = Log::Log4perl->get_logger(q{});
    	$log->error("Unable to acquire list of floodlight flows from $address: $status [$output]");
		return $status;
	}
    my $flows = from_json($output);
	return ($status, $flows);
}

sub flow_off_by_rulename { my ($floodlight_url, $rulename) = @_ ;
	my $address = "$floodlight_url/wm/staticflowentrypusher/json";
	my ($output, $status) = systemcall(qq{curl -q -s -X DELETE -d '{"name":"$rulename"}' $address});
	if ($status) {
		my $log = Log::Log4perl->get_logger(q{});
		$log->error("Unable to remove rule: $rulename from $address: $status [$output]");
		return $status;
	}
	return ($status, $output);
}

sub all_off { my ($floodlight_url, $floodlight_flowprefix) = @_ ;
	my ($status, $ref) = fetch_flows($floodlight_url);
	return 0 if ($status);
    my $nRemoved = 0;
    foreach my $key ( keys $ref ) {
        foreach my $rulename ( keys $ref->{$key} ) {
            if ($rulename =~ /^$floodlight_flowprefix/sxm) {
				($status, my $output) = flow_off_by_rulename($floodlight_url, $rulename);
                if (! $status) {
                	$nRemoved += 1;
				}
            }
        }
    }
    return $nRemoved;
}

sub getvmmacaddr { my ($vmname) = @_ ;
	my ($vmmac, $status) = systemcall(qq{virsh dumpxml $vmname | grep 'mac address'});
	if ($status) {
		my $log = Log::Log4perl->get_logger(q{});
		$log->error("Unable to get MAC address of $vmname: $status [$vmmac]");
		return q{};
	}
	if ($vmmac =~ m/((?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2})/isxm) {
		$vmmac = $1;
	}
	my $log = Log::Log4perl->get_logger(q{});
	$log->info("MAC address of $vmname [$vmmac]");
	return $vmmac;
}

sub getvmipaddr { my ($vmname, $vmdomain, $nameserver) = @_ ;
	my $host = $vmname . q{.} . $vmdomain;
	my ($vmip, $status);
	my $max_attempts = 15;
	my $sleep_time = 7;
	# sleep for at most sleep_time * (max_attempts - 1) on failure
	my $start_time = time();
	for my $attempt (1 .. $max_attempts) {
		($vmip, $status) = systemcall(qq{nslookup -nosearch $host $nameserver});
		if (! $status) {
			if ($vmip =~ m/Address:\ ((?:\d{1,3}\.){3}\d{1,3})/sxm) {
				$vmip = $1;
			}
			my $end_time = time();
			my $log = Log::Log4perl->get_logger(q{});
			$log->info("IP address of $vmname [$vmip] after $attempt attempts - time: ", $end_time - $start_time);
			last;
		}
		elsif ($attempt >= $max_attempts) {
			my $end_time = time();
			my $log = Log::Log4perl->get_logger(q{});
			$log->error("Unable to get IP address of $host $status [$vmip] after $attempt attempts - time: ", $end_time - $start_time);
			return q{};
		}
		sleep($sleep_time);
	}
	return $vmip;
}

sub trimaddr { my ($addr) = @_ ;
	my $retval = $addr;
	$addr =~ s/\://gsxm;
	$addr =~ s/\.//gsxm;
	$addr =~ s/\///gsxm;
	return $addr;
}

sub floodlight_flows_on { my ($floodlight_params, $parasoft_params, $vm_params) = @_ ;
	my $log = Log::Log4perl->get_logger(q{});
    my ($floodlight_url, $floodlight_flowprefix, $floodlight_port) = @{$floodlight_params};
	my ($ParasoftServerMAC, $ParasoftServerIP) = @{$parasoft_params};
	my ($vmname, $nameserver, $vmdomain) = @{$vm_params};
	my ($fstatus, $switches) = fetch_switches($floodlight_url);
	return [] if ($fstatus);
	my $idx = 1;    # Flows must have unique names, use a simple counter
	my $address = "$floodlight_url/wm/staticflowentrypusher/json";
	my ($vmmac, $vmip, $trimvmaddr);
	if ($ParasoftServerMAC) {
		$vmmac = getvmmacaddr($vmname);
    	$trimvmaddr = trimaddr($vmmac);
	}
	else {
		$vmip = getvmipaddr($vmname, $vmdomain, $nameserver);
		$trimvmaddr = trimaddr($vmip);
	}
	return [] if (! $vmmac && ! $vmip);
	my @rulenames;
	# Need a flow for each switch
	foreach my $switch (@{$switches}) {
		my $rulename = "$floodlight_flowprefix-$trimvmaddr-$idx";
    	my %flow = (
        	"switch"     => $switch->{'dpid'},
        	"name"       => $rulename,
        	"priority"   => 65,
        	'dst-port'   => $floodlight_port,
        	'protocol'   => '6',    # TCP protocol. If no protocol is specified,
                                	# Any proto is allowed
        	'ether-type' => '2048',
        	'active'     => 'true',
        	'actions'    => 'output=flood'
    	);
    	if ($ParasoftServerMAC) {
        	$flow{'dst-mac'} = $ParasoftServerMAC;
    		$flow{'src-mac'} = $vmmac;
    	}
    	else {
        	$flow{'dst-ip'} = $ParasoftServerIP . '/32';
    		$flow{'src-ip'} = $vmip;
    	}
    	my $flow_data = to_json( \%flow );
		my ($output, $status) = systemcall(qq{curl -q -s -X POST -d '$flow_data' $address});
		$log->trace("curl forward to: $address $status [$output] $flow_data");
		if ($status) {
			$log->error("Unable to add rule: $rulename to $address: $status [$output]");
		}
		else {
			push @rulenames, $rulename;
		}

    	$idx += 1;
    	# Update the flow rule for the reverse direction, allowing any port back
    	delete $flow{'dst-port'};
		$flow{'src-port'} = $floodlight_port;
		$rulename = "$floodlight_flowprefix-$trimvmaddr-$idx";
    	$flow{'name'} = $rulename;
    	if ($ParasoftServerMAC) {
        	$flow{'src-mac'} = $ParasoftServerMAC;
    		$flow{'dst-mac'} = $vmmac;
    	}
    	else {
        	$flow{'src-ip'} = $ParasoftServerIP . '/32';
    		$flow{'dst-ip'} = $vmip;
    	}
      	$flow_data = to_json( \%flow );
		($output, $status) = systemcall(qq{curl -q -s -X POST -d '$flow_data' $address});
		$log->trace("curl back to: $address $status [$output] $flow_data");
		if ($status) {
			$log->error("Unable to add rule: $rulename to $address: $status [$output]");
		}
		else {
			push @rulenames, $rulename;
		}

    	$idx++;
	}
	return \@rulenames;
}

sub openLicense { my ($bogref, $vmname) = @_ ;
	if (SWAMP::AssessmentTools::isParasoftTool($bogref)) {
		my $log = Log::Log4perl->get_logger(q{});
    	my $config = getSwampConfig();

        my $floodlight_url = $config->get('floodlight');
        my $floodlight_flowprefix = $config->get('floodlight_flowprefix');
        my $floodlight_port = int( $config->get('floodlight_port') );
		$log->trace("Floodlight: $floodlight_url $floodlight_port");

        my $ParasoftServerMAC = $config->get('parasoft_server_mac');
        my $ParasoftServerIP = $config->get('parasoft_server_ip');
		$log->trace("Parasoft: " . ($ParasoftServerMAC || 'N/A ') . ($ParasoftServerIP || 'N/A'));

		my $nameserver = $config->get('nameserver');
		my $vmdomain = $config->get('vmdomain');
		$log->trace("VM: $nameserver $vmdomain ");

		my $floodlight_params = [$floodlight_url, $floodlight_flowprefix, $floodlight_port];
		my $parasoft_params = [$ParasoftServerMAC, $ParasoftServerIP];
		my $vm_params = [$vmname, $nameserver, $vmdomain];
		my $rulenames = floodlight_flows_on($floodlight_params, $parasoft_params, $vm_params);
		foreach my $rulename (@{$rulenames}) {
			$log->trace("added rule: $rulename");
		}
		return $rulenames;
	}
	return ;
}

sub closeLicense { my ($bogref, $license_result) = @_ ;
	if (SWAMP::AssessmentTools::isParasoftTool($bogref)) {
    	my $config = getSwampConfig();
        my $floodlight_url = $config->get('floodlight');
		my $log = Log::Log4perl->get_logger(q{});
		foreach my $rulename (@{$license_result}) {
			flow_off_by_rulename($floodlight_url, $rulename);
			$log->trace("removed rule: $rulename");
		}
	}
	return ;
}

1;

__END__
=pod

=encoding utf8

=head1 NAME

SWAMP::Floodlight - Interface to floodlight controller

=head1 SYNOPSIS

 use SWAMP::Floodlight qw(deleteFlows);

 if (deleteFlows($myvmname, 'http://swa-flood-dt-01.cosalab.org:8080')) {
    say "All workflows associated with $myvmname have been removed";
 }

=head1 DESCRIPTION

The SWAMP::Floodlight module implements stateless methods for manipulating the floodlight 
controller. Currently the only method implemented is deleteFlows which takes are parameters the 
name of a virtual machine and the name of the floodlight controller.

=head1 COPYRIGHT

    Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research

    This library is free software; you can redistribute it and/or modify it
    under the same terms as Perl itself.

=cut
