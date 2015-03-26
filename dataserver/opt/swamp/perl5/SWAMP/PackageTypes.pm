#** @file PackageTypes.pm
# 
# @brief Mapping of package type names to enumerated values
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 09/25/2014 13:14:16
# @copy Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::PackageTypes;

use 5.010;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

BEGIN {
    our $VERSION = '0.84';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(
      $GENERIC_PKG
      $C_CPP_PKG
      $JAVASRC_PKG
      $JAVABYTECODE_PKG
      $PYTHON2_PKG
      $PYTHON3_PKG
      $C_CPP_PKG_STRING
      $ANDROID_JAVASRC_PKG_STRING
      $JAVASRC_PKG_STRING
      $JAVABYTECODE_PKG_STRING
      $PYTHON2_PKG_STRING
      $PYTHON3_PKG_STRING

      $CPP_TYPE
      $JAVA_TYPE
      $PYTHON_TYPE
    );
}

# Package types from the database package_store.package_type table.
# 1 C/C++
# 2 Java Source Code
# 3 Java Bytecode
# 4 Python2
# 5 Python3
#
our $GENERIC_PKG      = '0';
our $C_CPP_PKG        = '1';
our $JAVASRC_PKG      = '2';
our $JAVABYTECODE_PKG = '3';
our $PYTHON2_PKG      = '4';
our $PYTHON3_PKG      = '5';

our $PYTHON_TYPE = 'python';
our $JAVA_TYPE = 'java';
our $CPP_TYPE = 'cpp';

our $GENERIC_PKG_STRING      = 'generic';
our $C_CPP_PKG_STRING        = 'C/C++';
our $ANDROID_JAVASRC_PKG_STRING      = 'Android Java Source Code';
our $JAVASRC_PKG_STRING      = 'Java Source Code';
our $JAVABYTECODE_PKG_STRING = 'Java Bytecode';
our $PYTHON2_PKG_STRING      = 'Python2';
our $PYTHON3_PKG_STRING      = 'Python3';

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
 

