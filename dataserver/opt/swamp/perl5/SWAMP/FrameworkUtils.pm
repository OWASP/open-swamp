#** @file FrameworkUtils.pm
#
# @brief Methods for assisting with UW framework
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 04/30/2014 09:44:47
# @copy Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::FrameworkUtils;

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
    @EXPORT_OK = qw(ReadStatusOut savereport generatereport);
}

use English '-no_match_vars';
use File::Basename qw(basename dirname);
use File::Spec qw(devnull catfile);
use Carp qw(croak carp);

use XML::LibXML;
use XML::LibXSLT;
use SWAMP::SWAMPUtils qw(getSWAMPDir);


my $stdDivPrefix = q{ } x 2;
my $stdDivChars  = q{-} x 10;
my $stdDiv       = "$stdDivPrefix$stdDivChars";

# statusOutObj = ReadStatusOut(filename)
#
# ReadStatusOut returns a hash containing the parsed status.out file.
#
# A status.out file consists of task lines in the following format with the
# names of these elements labeled
#
#     PASS: the-task-name (the-short-message)           40.186911s
#
#     |     |              |                            |        |
#     |     task           shortMsg                     dur      |
#     status                                               durUnit
#
# Each task may also optional have a multi-line message (the msg element).
# The number of spaces before the divider are removed from each line and the
# line-feed is removed from the last line of the message
#
#     PASS: the-task-name (the-short-message)           40.186911s
#       ----------
#       line A
#       line A+1
#       ----------
# The returned hash contains a hash for each task.  The key is the name of the
# task.  If there are duplicate task names, duplicate keys are named using the
# scheme <task-name>#<unique-number>.
#
# The hash for each task contains the following keys
#
#   status    - one of PASS, FAIL, SKIP, or NOTE
#   task      - name of the task
#   shortMsg  - shortMsg or undef if not present
#   msg       - msg or undef if not present
#   dur       - duration is durUnits or undef if not present
#   durUnit   - durUnits: 's' is for seconds
#   linenum   - line number where task started in file
#   name      - key used in hash (usually the same as task)
#   text      - unparsed text
#
# Besided a hash for each task, the hash function returned from ReadStatusOut
# also contains the following additional hash elements:
#
#   #order     - reference to an array containing references to the task hashes
#                in the order they appeared in the status.out file
#   #errors    - reference to an array of errors in the status.out file
#   #warnings  - reference to an array of warnings in the status.out file
#   #filename  - filename read
#
# If there are no errors or warnings (the arrays are 0 length), then exists can
# be used to check for the existence of a task.  The following would correctly
# check if that run succeeded:
#
# my $s = ReadStatusOut($filename)
# if (!@{$s->{'#errors'}} && !@{$s->{'#warnings'}})  {
#     if (exists $s->{all} && $s->{all}{status} eq 'PASS')  {
#         print "success\n";
#     }  else  {
#         print "no success\n";
#     }
# }  else  {
#     print "bad status.out file\n";
# }
#
#
sub ReadStatusOut {
    my $statusFile = shift;

    my %status = (
        '#order'    => [],
        '#errors'   => [],
        '#warnings' => [],
        '#filename' => $statusFile
    );

    my $lineNum = 0;
    my $fh;
    if ( !open $fh, "<", $statusFile ) {
        push @{ $status{'#errors'} }, "open $statusFile failed: $OS_ERROR";
        return \%status;
    }
    my ( $lookingFor, $name, $prefix, $divider ) = ( 'task', q{} );
    while (<$fh>) {
        ++$lineNum;
        my $line = $_;
        chomp;
        if ( $lookingFor eq 'task' ) {
            if (/^( \s*)(-+)$/sxm) {
                ( $prefix, $divider ) = ( $1, $2 );
                $lookingFor = 'endMsg';
                if ( $name eq q{} ) {
                    push @{ $status{'#errors'} },
                      "Message divider before any task at line $lineNum";
                    $status{$name}{'linenum'} = $lineNum;
                }
                if ( defined( $status{$name}{'text'} ) && ( $status{$name}{'text'} =~ tr/\n// ) > 1 ) {
                    push @{ $status{'#errors'} },
                      "Message found after another message at line $lineNum";
                    $status{$name}{'msg'} .= "\n";
                }
                if ( $_ ne $stdDiv ) {
                    push @{ $status{'#errors'} },
                      "Non-standard message divider '$_' at line $lineNum";
                }
                $status{$name}{'text'} .= $line;
                $status{$name}{'msg'}  .= q{};
            }
            else {
                s/\s*$//sxm;
                if (/^\s*$/sxm) {
                    push @{ $status{'#warnings'} }, "Blank line at line $lineNum";
                    next;
                }
                if (/^(\s*)([a-zA-Z0-9_-]+):\s+([a-zA-Z0-9_-]+)\s*(.*)$/sxm) {
                    my ( $pre, $status, $task, $remain ) = ( $1, $2, $3, $4 );
                    $name = $task;
                    if ( exists $status{$name} ) {
                        push @{ $status{"#warnings"} },
                          "Duplicate task name found at lines $status{$name}{'linenum'} and $lineNum";
                        my $i = 0;
                        do {
                            ++$i;
                            $name = "$task#$i";
                        } until ( !exists $status{$name} ); ## no critic (ControlStructures)

                    }
                    my ( $shortMsg, $dur, $durUnit );

                    if ( $remain =~ /^\((.*?)\)\s*(.*)/sxm ) {
                        ( $shortMsg, $remain ) = ( $1, $2 );
                    }
                    if ( $remain =~ /^(\d+(?:\.\d+)?)([a-zA-Z]*)\s*(.*)$/sxm ) {
                        ( $dur, $durUnit, $remain ) = ( $1, $2, $3 );
                    }

                    if ( $pre ne q{} ) {
                        push @{ $status{'#warnings'} },
                          "White space before status at line $lineNum";
                    }
                    if ( $remain ne q{} ) {
                        push @{ $status{'#errors'} }, "Bad status.out at line: $lineNum";
                    }
                    if ( defined $dur ) {
                        if ( $durUnit eq q{} ) {
                            push @{ $status{'#errors'} }, "Missing duration unit at line $lineNum";
                        }
                        elsif ( $durUnit ne 's' ) {
                            push @{ $status{'#errors'} }, "Duration unit not 's' at line $lineNum";
                        }
                    }
                    if ( defined $shortMsg ) {
                        if ( $shortMsg =~ /\(/sxm ) {
                            push @{ $status{'#warnings'} },
                              "Short message contains '(' at line $lineNum";
                        }
                    }

                    if ( $status !~ /^(?:NOTE|SKIP|PASS|FAIL)$/isxm ) {
                        push @{ $status{'#errors'} }, "Unknown status '$status' at line $lineNum";
                    }
                    elsif ( $status !~ /^(?:NOTE|SKIP|PASS|FAIL)$/sxm ) {
                        push @{ $status{'#warnings'} },
                          "Status '$status' should be uppercase at line $lineNum";
                    }

                    $status{$name} = {
                        'status'   => $status,
                        'task'     => $task,
                        'shortMsg' => $shortMsg,
                        'msg'      => undef,
                        'dur'      => $dur,
                        'durUnit'  => $durUnit,
                        'linenum'  => $lineNum,
                        'name'     => $name,
                        'text'     => $line
                    };
                    push @{ $status{'#order'} }, $status{$name};
                }
            }
        }
        elsif ( $lookingFor eq 'endMsg' ) {
            $status{$name}{'text'} .= $line;
            if (/^$prefix$divider$/sm) { ## no critic (RegularExpressions::RequireExtendedFormatting)
                $lookingFor = 'task';
                chomp $status{$name}{'msg'};
            }
            else {
                $line =~ s/^$prefix//sxm;
                $status{$name}{'msg'} .= $line;
            }
        }
        else {
            croak "Unknown lookingFor value = $lookingFor";
        }
    }
    if ( !close $fh ) {
        push @{ $status{'#errors'} }, "close $statusFile failed: $OS_ERROR";
    }

    if ( $lookingFor eq 'endMsg' ) {
        my $ln = $status{$name}{'linenum'};
        push @{ $status{'#errors'} },
          "Message divider '$prefix$divider' not seen before end of file at line $ln";
        if ( defined $status{$name}{'msg'} ) {
            chomp $status{$name}{'msg'};
        }
    }

    return \%status;
}

###my $s = ReadStatusOut($ARGV[0]);
###my $errCnt = scalar @{$s->{'#errors'}};
###my $warnCnt = scalar @{$s->{'#warnings'}};
###my $filename = $s->{'#filename'};
###
###print "$filename   (errors: $errCnt, warnings: $warnCnt)\n";
###print "Errors:\n\t", join("\n\t", @{$s->{'#errors'}}), "\n" if $errCnt;
###print "Warnings:\n\t", join("\n\t", @{$s->{'#warnings'}}), "\n" if $warnCnt;
###foreach my $t (@{$s->{'#order'}})  {
###    my $status = $t->{status};
###    my $taskName = $t->{task};
###    print "$status $taskName\n";
###}
###
###use Data::Dumper;
###
###print "--------------------\n";
###print Dumper($s);
sub generatereport {
    my $tarball = shift;
    my $status = loadStatusOut($tarball);
    my %report;
    $report{'tarball'} = basename $tarball;

    if ($status) {
        $report{'error'} = addErrorNote( $status, $tarball );
        my $string;
        my $nOut;
        my $nErr;
        $report{'no-build'} = addBuildfailures( $status, $tarball );
        ($nOut, $string) = addStdout( $status, $tarball );
        if ($nOut > 0) {
            $report{'stdout'} = $string;
        }
        ($nErr, $string) = addStderror( $status, $tarball );
        if ($nErr > 0) {
            $report{'stderr'} = $string;
        }
        if (($nOut + $nErr) == 0) {
            $report{'error'} .= q{<p><b>Unable to find specific stdout/stderr, showing output from entire assessment:</b><p>};
            $report{'error'} .= rawTar($tarball, q{out/run.out});
        }
        $string = rawTar($tarball, q{out/versions.txt});
        if ($string) {
            $report{'versions'} = $string;
        }
    }
    else {
        $report{'error'} = addGenericError( $tarball );
    }
    return %report;
}
sub savereport {
    my ( $report, $filename, $url ) = @_;
    my $fh;
    my $uuid = dirname ($filename);
    $uuid =~ s/^.*\///sxm;
    if ( !open $fh, '>', $filename ) {
        return 0;
    }
    print $fh qq{<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n};

    print $fh "<HTML><HEAD><TITLE>Failed Assessment Report</TITLE></HEAD>\n";
    print $fh "<BODY>\n";
    print $fh "<H2>Failed Assessment Report</H2>";

    if ( $report->{'no-build'} ) {
        print $fh "<li><a href=#nobuild>Error messages from no-build step</a></li>\n";
    }
    if ( $report->{'error'} ) {
        print $fh "<li><a href=#error>Error messages from assessment</a></li>\n";
    }
    if ( $report->{'stdout'} ) {
        print $fh "<li><a href=#stdout>Standard out</a></li>\n";
    }
    if ( $report->{'stderr'} ) {
        print $fh "<li><a href=#stderr>Standard error</a></li>\n";
    }
    if ( $report->{'versions'} ) {
        print $fh "<li><a href=#versions>Version information</a></li>\n";
    }
    print $fh qq{<li><a href=${url}$uuid/$report->{'tarball'}>Download all failed results as a single file</a></li>};
    print $fh "<p>";
    if ($report->{'no-build'}) {
        print $fh "$report->{'no-build'}\n";
    }
    if ( $report->{'error'} ) {
        print $fh "<h3><a id=\"error\">Error messages from assessment</a></h3>\n";
        print $fh "<pre>$report->{'error'}</pre>\n";
    }
    if ( $report->{'stdout'} ) {
        print $fh "<hr><h3><a id=\"stdout\">Standard out</a></h3>\n";
        print $fh "<pre>$report->{'stdout'}</pre>\n";
    }
    if ( $report->{'stderr'} ) {
        print $fh "<hr><h3><a id=\"stderr\">Standard error</a></h3>\n";
        print $fh "<pre>$report->{'stderr'}</pre>\n";
    }
    if ($report->{'versions'}) {
        print $fh "<hr><h3><a id=\"versions\">Version information</a></h3>\n";
        my @versions =split(/\n/sxm, $report->{'versions'});
        print $fh "<pre><TABLE><TR><TH align=left>Component</TH><TH align=left>Version</TH>\n";
        foreach (@versions) {
            my ($component,$version)=split(/:/sxm);
            print $fh "<TR><TD>$component</TD><TD>$version</TD>\n";
        }
        print $fh "</TABLE></pre>\n";
    }
    print $fh "<h5><pre>Report generated: ",scalar localtime,"</pre></h5>\n";
    print $fh "</BODY>\n";
    print $fh "</HTML>\n";
    if (!close $fh) {
        
    }
    return 1;
}

sub loadStatusOut {
    my $tarfile   = shift;
    my $statusOut = rawTar($tarfile);
    if ($statusOut) {
        if (open( my $fh, '>', q{tmps.out} )) {
            print $fh $statusOut;
            if (!close($fh)) {

            }
            return ReadStatusOut(q{tmps.out});
        }
    }
    return;
}

sub addErrorNote {
    my ( $s, $tarfile ) = @_;
    my $note;
    if ( !@{ $s->{'#errors'} } && !@{ $s->{'#warnings'} } ) {
        if ( exists $s->{'all'} && $s->{'all'}{'status'} eq 'PASS' ) {
            $note  = "No errors detected";
        }
        else {
            my $errCnt   = scalar @{ $s->{'#errors'} };
            my $warnCnt  = scalar @{ $s->{'#warnings'} };
            my $filename = $s->{'#filename'};
            my $errorString;

            $note = "$filename   (errors: $errCnt, warnings: $warnCnt)\n";

            #print "Errors:\n\t",   join( "\n\t", @{ $s->{'#errors'} } ),   "\n" if $errCnt;
            #print "Warnings:\n\t", join( "\n\t", @{ $s->{'#warnings'} } ), "\n" if $warnCnt;
            $errorString .=
              '<TABLE><TR><TH align=left>Failing Step</TH><TH align=left>Error Message</TH></TR>';
            foreach my $t ( @{ $s->{'#order'} } ) {
                my $status   = $t->{'status'};
                my $taskName = $t->{'task'};
                if ( $taskName ne q{all} && $status eq q{FAIL} ) {
                    $errorString .= "<TR><TD>$taskName</TD>";
                    if (defined($t->{'msg'})) {
                        $errorString .= "<TD>$t->{msg}</TD></TR>";
                    }
                    else {
                        $errorString .= "<TD>No error message found</TD>";
                    }
                }
            }
            $errorString .= '</TABLE>';
            $note = $errorString;
        }
    }
    else {
        #    say Dumper($s);
        $note = q{Unable to parse status.out};
    }
    return $note;
}

sub tarTarTOC {
    my $tarball = shift;
    my $subfile = shift;
    my ( $output, $status ) =
      ( $_ = qx {tar -O -xzf $tarball $subfile | tar tzvf - 2>/dev/null}, $CHILD_ERROR >> 8 );
    if ($status) {
        return;
    }
    else {
        return split( /\n/sxm, $output );
    }
}
sub tarCat{
    my $tarball = shift;
    my $subfile = shift;
    my $file = shift;
    my ( $output, $status ) =
      ( $_ = qx {tar -O -xzf $tarball $subfile | tar -O -xzf - $file 2>/dev/null}, $CHILD_ERROR >> 8 );
    if ($status) {
        return;
    }
    else {
        return $output;
    }
}
sub tarTOC {
    my $tarball = shift;
    my ( $output, $status ) = ( $_ = qx {tar -tzvf $tarball 2>/dev/null}, $CHILD_ERROR >> 8 );
    if ($status) {
        return;
    }
    else {
        return split( /\n/sxm, $output );
    }
}
sub addBuildfailures {
    my ( $status_out, $tarfile ) = @_;

    my @files = tarTOC($tarfile);
    foreach (@files) {
        if (/source-compiles.xml/xsm) {
            my $rawxml = rawTar($tarfile, q{out/source-compiles.xml});
            my $xslt = XML::LibXSLT->new();
            my $source;
            my $success = eval { $source = XML::LibXML->load_xml( 'string' => $rawxml ); };
            my $xsltfile =  File::Spec->catfile( getSWAMPDir(), 'etc', 'no-build.xslt' );
            if ( defined($success) ) {
                my $style_doc  = XML::LibXML->load_xml( 'location' => "$xsltfile", 'no_cdata' => 1 );
                my $stylesheet = $xslt->parse_stylesheet($style_doc);
                my $result = $stylesheet->transform($source);
                return $result->toString();
            }
        }
    }
    return;
}
sub addStdout {
    my ( $status_out, $tarfile ) = @_;
    return findFiles($tarfile, q{(build_stdout|configure_stdout|resultparser.log)});

}
sub addStderror {
    my ( $status, $tarfile ) = @_;
    return findFiles($tarfile, q{(build_stderr|configure_stderr)});
}
sub findFiles {
    my ($tarfile, $pattern) = @_;
    my $string;
    my @files=tarTOC($tarfile);
    my $nFound = 0;
    foreach (@files) {
        if (/.tar.gz$/sxm) {
            chomp;
            my @line=split(q{ }, $_);
            my $files = getFiles($tarfile, $pattern, $line[-1]);
            if ($files) { 
                $string .= $files;
                $nFound++;
            }
        }
    }
    return ($nFound, $string);

}

sub getFiles {
    my ( $tarfile, $pattern, $subfile ) = @_;
    my @files = tarTarTOC( $tarfile, $subfile );
    my $str;
    #say "Looking for $pattern in $subfile in $tarfile";
    foreach (@files) {
        if (/$pattern/sxm) {
            if (/swa_tool/sxm) {
                next;
            }
            chomp;
            #say "file $_";
            my @line = split( q{ }, $_ );
            $str .= "<b>FILE: $line[-1] from $subfile</b>\n";
            $str .= tarCat( $tarfile, $subfile, $line[-1] );
            $str .= q{<p>};
        }
    }
    return $str;
}
sub addGenericError {
    my ($tarfile ) = @_;
    return q{Unable to determine the final status of the assessment.};

}

sub rawTar {
    my $tarball = shift;
    my $file = shift // q{out/status.out};
    my ( $output, $status ) =
      ( $_ = qx {tar -O -xzf $tarball $file 2>/dev/null}, $CHILD_ERROR >> 8 );
    if ($status) {
        return;
    }
    else {
        return $output;
    }
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
 

