#** @file CodeDX.pm
#
# @brief Interface to CodeDX
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 12/17/2013 15:51:41
# @copy Copyright (c) 2013 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::CodeDX;

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
      listprojects
      createproject
      deleteproject
      uploadanalysisrun);
}

use English '-no_match_vars';
use Carp qw(croak carp);
use Log::Log4perl;
use Log::Log4perl::Level;
#
# Pre-1.5.1 Code Dx API needs uri_escape
# use URI::Escape qw(uri_escape);

use SWAMP::SWAMPUtils qw(systemcall);
use JSON qw(from_json);

#** @function listprojects( $host, $apikey, $project, $package)
# @brief Create a CodeDX project (SWAMP package) if it does not already exist
#
# @param $host The IP address of the VM running the CodeDX instance
# @param $apikey The API Key used to authenticate with the CodeDX instance
# @param $project The name of the SWAMP project which is also the folder containing the CodeDX files
# @return A HASH of project(SWAMP package)  names indexed by CodeDX ids on success, { 'error' => 'reason'} on failure.
#
#*
sub listprojects {
    my $host    = shift;
    my $apikey  = shift;
    my $project = shift;
    # Code Dx 1.5 and beyond API
    my $curl    = qq{curl -ks -H "AUTHORIZATION: System-Key $apikey"  -X GET https://$host/$project/api/projects};
    
    # Code Dx pre-1.5 API
    # my $curl    = qq{curl -ks -H "API-Key: $apikey"  -X GET https://$host/$project/api/project};

    my %projects;
    my ( $output, $status ) = systemcall($curl);
    if ($status) {    # error
        $projects{'error'} = $output;
        Log::Log4perl->get_logger(q{})->error("Error listing projects: $output");
    }
    else {
        my $ref = from_json($output);
        if ($ref->{'error'}) {
            $projects{'error'} = $ref->{'error'};
            Log::Log4perl->get_logger(q{})->warn("Error listing projects: [$ref->{'error'}]");
        }
        else {
            my $aref = $ref->{'projects'};
            foreach my $proj (@{$aref}) {
                $projects{$proj->{'id'}} = $proj->{'name'};
            }
        }
    }
    return %projects;
}

#** @function createproject( $host, $apikey, $project, $package)
# @brief Create a CodeDX project (SWAMP package) if it does not already exist
#
# @param $host The IP address of the VM running the CodeDX instance
# @param $apikey The API Key used to authenticate with the CodeDX instance
# @param $project The name of the SWAMP project which is also the folder containing the CodeDX .htaccess file
# @param $package the SWAMP package, CodeDX project, to create.
# @return -1 on failure, ProjectID on success
#*
sub createproject {
    my $host      = shift;
    my $apikey    = shift;
    my $project   = shift;
    my $package   = shift;
    my $ret       = -1;
    my $projectID = _getprojectid( $host, $apikey, $project, $package );

    if ( $projectID != -1 ) {
        return $projectID;    # Found it.
    }
    # N.B. ONLY Here do we use the uri_escaped form of the package name, hence forth the 
    # unescaped version will work AND must be the unescaped version.
    # New API for 1.5 doesn't require escaped
    # my $escaped = uri_escape($package);

    my $curl =
    # New API for Code Dx 1.5 and beyond
     qq{curl -ks -H "Content-type: application/json" -d '{ "name" : "$package" }' -H "AUTHORIZATION: System-Key $apikey"  -X PUT https://${host}/$project/api/projects};

    # Pre Code Dx 1.5 API
    # qq{curl -ks -H "API-Key: $apikey"  -X PUT https://${host}/$project/api/project?project_name="$escaped"};

    my ( $output, $status ) = systemcall($curl);
    if ( $status == 0 ) {
        $ret = _getprojectid( $host, $apikey, $project, $package );
    }
    else {
        Log::Log4perl->get_logger(q{})
          ->error("Error creating project <$host,$project,$package>: $output ($status) [$curl]");
    }
    return $ret;
}

sub _checkAPIReturn {
    my $output = shift;
    if (length($output)) {
        my $ref = from_json($output);
        if ($ref->{'error'}) {
            return $ref->{'error'};
        }
    }
    return q{SUCCESS};
}
sub _getprojectid {
    my $host            = shift;
    my $apikey          = shift;
    my $project         = shift;
    my $package         = shift;                                      # The sought package
    my %currentProjects = listprojects( $host, $apikey, $project );
    my $projectID       = -1;
    if ( !defined( $currentProjects{'error'} ) ) {
        foreach my $id ( keys %currentProjects ) {
            # SWAMP packages are CodeDX projects
            if ( $currentProjects{$id} eq $package ) {
                $projectID = $id;
                last;
            }
        }
    }
    return $projectID;
}

#** @function deleteproject( $host, $apikey, $project, $package)
# @brief Delete a CodeDX project (SWAMP package)
#
# @param $host The IP address of the VM running the CodeDX instance
# @param $apikey The API Key used to authenticate with the CodeDX instance
# @param $project The name of the SWAMP project which is also the folder containing the CodeDX .htaccess
# @param $package the SWAMP package, CodeDX project, to delete.
# @return 0 on failure, 1 on success
# @see
#*
sub deleteproject {
    my $host      = shift;
    my $apikey    = shift;
    my $project   = shift;
    my $package   = shift;
    my $projectID = _getprojectid( $host, $apikey, $project, $package );
    my $ret       = 0;
    if ( $projectID != -1 ) {
        my $curl =
        # Code Dx 1.5 and beyond API
        qq{curl -ks -H "Authorization: System-Key $apikey"  -X DELETE https://$host/$project/api/projects/$projectID};
        # Code Dx pre-1.5 API
        # qq{curl -ks -H "API-Key: $apikey" -X DELETE https://$host/$project/api/project/$projectID};

        my ( $output, $status ) = systemcall($curl);
        if ( $status == 0 ) {
            if (_checkAPIReturn($output) ne q{SUCCESS})  {
                Log::Log4perl->get_logger(q{})
                  ->error("Error deleting project <$host,$project,$package>:[$curl} $output");
                
            }
            else {
                $ret = 1;
            }
        }
        else {
            Log::Log4perl->get_logger(q{})
              ->error("Error deleting project <$host,$project,$package>:[$curl} $output");
        }
    }
    return $ret;
}

sub uploadanalysisrun {
    my $host      = shift;
    my $apikey    = shift;
    my $project   = shift;
    my $package   = shift;
    my $files     = shift;                                              # This is an array reference
    my $ret       = 0;
    my $projectID = createproject( $host, $apikey, $project, $package );
    if ( $projectID != -1 ) {
        my $curl =
        # Code Dx 1.5 and beyond API
        qq{curl -ks -H "Authorization: System-Key $apikey" https://$host/$project/api/projects/$projectID/analysis};
        # Code Dx pre-1.5 API
        # qq{curl -ks -H "API-Key: $apikey" https://$host/$project/api/project/$projectID/analysis};
        my $nn = 1;
        for my $file ( @{$files} ) {
            $curl .= " -F \"file${nn}=\@$file\"";
            $nn++;
        }
        my ( $output, $status ) = systemcall($curl);
        if ( $status == 0 ) {
            my $apiResult = _checkAPIReturn($output);
            if ($apiResult eq q{SUCCESS}) {
                $ret = 1;
            }
            else {
                Log::Log4perl->get_logger(q{})
                  ->warn("uploading project failed $apiResult");
          }
            Log::Log4perl->get_logger(q{})
              ->info("uploading project <$host,$project,$package>: $output [$curl]");
        }
        else {
            Log::Log4perl->get_logger(q{})
              ->error("Error uploading project <$host,$project,$package>: $output ($status) [ $curl ]");
        }
    }
    else {
        Log::Log4perl->get_logger(q{})
          ->error("Error uploading project cannot find ID.<$host,$project,$package>");
    }
    return $ret;
}

1;

__END__
=pod

=encoding utf8

=head1 NAME

=head1 SYNOPSIS

Package interface to CodeDX

=head1 DESCRIPTION

=head1 OPTIONS

=over 8

=item 


=back

=head1 EXAMPLES

=head1 SEE ALSO

=cut
 

