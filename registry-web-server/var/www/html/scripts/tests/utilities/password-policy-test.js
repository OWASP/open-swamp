require(["jquery", "scripts/utilities/password-policy"], function($, PasswordPolicy)
{
  module("Password Strength");

  test("Length based on including symbols", function( )
  {
                            //12345678901
    var pass_with_special  = "A1@iopjkl"
    var pass_wout_special  = "A1xiopjklo"

    var short_with_special = "A1@iopjk"
    var short_wout_special = "A1xiopjkl"

    equal($.validator.passwordRating(pass_with_special,  "someuser").messageKey, "strong",    "9 with special character: "     + pass_with_special);
    equal($.validator.passwordRating(pass_wout_special,  "someuser").messageKey, "strong",    "10 without special character: " + pass_wout_special);

    equal($.validator.passwordRating(short_with_special, "someuser").messageKey, "too-short", "9 with special character: "     + short_with_special);
    equal($.validator.passwordRating(short_wout_special, "someuser").messageKey, "too-short", "10 without special character: " + short_wout_special);
  });


  test("Length is not affected by position of uppercase letter", function ( )
  {
                            //12345678901
    var pass_with_special  = "a1@iOpjkl"
    var pass_wout_special  = "a1xiOpjklo"

    var short_with_special = "a1@iOpjk"
    var short_wout_special = "a1xiOpjkl"

    equal($.validator.passwordRating(pass_with_special,  "someuser").messageKey, "strong",    "9 with special character: "     + pass_with_special);
    equal($.validator.passwordRating(pass_wout_special,  "someuser").messageKey, "strong",    "10 without special character: " + pass_wout_special);

    equal($.validator.passwordRating(short_with_special, "someuser").messageKey, "too-short", "9 with special character: "     + short_with_special);
    equal($.validator.passwordRating(short_wout_special, "someuser").messageKey, "too-short", "10 without special character: " + short_wout_special);
  });
});
