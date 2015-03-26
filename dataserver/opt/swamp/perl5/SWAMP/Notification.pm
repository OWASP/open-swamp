#** @file Notification.pm
#
# @brief
# @author Dave Boulineau (db), dboulineau@continuousassurance.org
# @date 08/07/2014 11:12:06
# @copy Copyright (c) 2014 Software Assurance Marketplace, Morgridge Institute for Research
#*
#
package SWAMP::Notification;

use 5.014;
use utf8;
use strict;
use warnings;
use parent qw(Exporter);

use Log::Log4perl;
use SWAMP::SWAMPUtils qw(getSwampConfig systemcall trim);
use Email::Sender::Simple qw(try_to_sendmail);
use Email::Sender::Transport::SMTP;
use Email::MIME;

BEGIN {
    our $VERSION = '0.84';
}
our (@EXPORT_OK);

BEGIN {
    require Exporter;
    @EXPORT_OK = qw(getNotifier
    );
}

use English '-no_match_vars';
use Carp qw(croak carp);

my $log;

my %notifiers = (
    'EMAIL' => \&emailNotify,
    'SMS'   => \&smsNotify,
    'LOG'   => \&logNotify,
);

sub getNotifier {
    my $media = shift // q{LOG};
    if ( defined( $notifiers{$media} ) ) {
        return $notifiers{$media};
    }
    $log = Log::Log4perl->get_logger(q{});
    $log->warn("Unknown notifier medium provided: $media, using logger");
    return \&logNotify;
}

sub emailNotify {
    my %opts = (
        @_,    # actual args override
    );
    $log = Log::Log4perl->get_logger(q{});
    my $config   = getSwampConfig();
    my $template = $config->get('email.arun.complete');
    my $host = $config->get('email.host');
    my $from = $config->get('email.from');
    my $subject = $config->get('email.arun.subject');
    my $defaulttemplate =
qq{<USER>,\n\nYour assessment of <PACKAGE> using <TOOL> on <PLATFORM> completed at <COMPLETIONTIME> with a status of <SUCCESS>.\n\n-The Software Assurance Marketplace (SWAMP)};

    if ( !$template ) {
        $template = $defaulttemplate;
    }
    if (!$host) {
        $host = 'swa-service-1.mirsam.org';
    }
    if (!$subject) { 
        $subject = 'Your SWAMP assessment has completed';
    }
    if (!$from) {
#      $from = '"Software Assurance Marketplace: Do Not Reply"<do-not-reply@mir-swamp.org>';
    }
    my ( $user, $email ) = getUserAndEmailLDAP( $opts{'user_uuid'} );
    if (!defined($email)) {
        $log->error("Cannot acquire user email address"); 
        return 0;
    }
    $template =~s/<CR>/\n/sxmg;
    $template =~s/<USER>/$user/sxmg;
    $template =~s/<PACKAGE>/'$opts{'package_name'} $opts{'package_version'}'/sxmg;
    $template =~s/<TOOL>/'$opts{'tool_name'} $opts{'tool_version'}'/sxmg;
    $template =~s/<PLATFORM>/'$opts{'platform_name'} $opts{'platform_version'}'/sxmg;
    $template =~s/<COMPLETIONTIME>/$opts{'completion_date'}/sxmg;
    $template =~s/<SUCCESS>/$opts{'success_or_failure'}/sxmg;
    my $transport = Email::Sender::Transport::SMTP->new( { 'host' => $host } );
    $log->info("NotifyEmail: Sending an email to <$email>");
    my $message = Email::MIME->create(
        'header_str' => [
            'From' => $from,
            'To'      => $email,
            'Subject' => $subject
        ],
        'attributes' => {
            'encoding' => 'quoted-printable',
            'charset'  => 'utf-8',
        },
        'body_str' => $template,
    );
    return try_to_sendmail( $message, { 'transport' => $transport } );
}

sub smsNotify {
    $log = Log::Log4perl->get_logger(q{});
    $log->info("smsNotify @_");
    return 0;
}

sub logNotify {
    $log = Log::Log4perl->get_logger(q{});
    $log->info("logNotify: @_");
    return 1;
}

sub getUserAndEmailLDAP {
    my $useruuid = shift;
    my $config   = getSwampConfig();
    my $ldapuri = $config->get('ldap.uri');
    my $ldappass = $config->get('ldap.auth');
    my ( $output, $status ) = systemcall(
qq{ldapsearch -H $ldapuri -w '$ldappass' -x -D "uid=userRegistryWebApp,ou=system,o=SWAMP,dc=cosalab,dc=org" -b "swampUuid=$useruuid,ou=people,o=SWAMP,dc=cosalab,dc=org" -s sub -a always -u -l 20 -LLL mail givenName sn}
    );
    my ( $email, $surname, $givenName );
    if ( !$status ) {
        my @lines = split( /\n/sxm, $output );
        foreach (@lines) {
            if (/^sn:(.*)$/sxm) {
                $surname = trim($1);
            }
            elsif (/^mail:(.*)$/sxm) {
                $email = trim($1);
            }
            elsif (/^givenName:(.*)$/sxm) {
                $givenName = trim($1);
            }
        }
    }
    else {
        $log->warn("Unable to perform ldapsearch: $output [$status]");
    }
    return ( "$givenName $surname", $email );
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
 

