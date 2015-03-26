Date.parseIso8601 = function(CurDate) {

    // Check the input parameters
    //
    if ( typeof CurDate != "string" || CurDate == "" ) {
        return null;
    };

    // Set the fragment expressions
    //
    var S = "[\\-/:.]";
    var Yr = "((?:1[6-9]|[2-9][0-9])[0-9]{2})";
    var Mo = S + "((?:1[012])|(?:0[1-9])|[1-9])";
    var Dy = S + "((?:3[01])|(?:[12][0-9])|(?:0[1-9])|[1-9])";
    var Hr = "(2[0-4]|[01]?[0-9])";
    var Mn = S + "([0-5]?[0-9])";
    var Sd = "(?:" + S + "([0-5]?[0-9])(?:[.,]([0-9]+))?)?";
    var TZ = "(?:(Z)|(?:([\+\-])(1[012]|[0]?[0-9])(?::?([0-5]?[0-9]))?))?";

    // RegEx the input
    // First check: Just date parts (month and day are optional)
    // Second check: Full date plus time (seconds, milliseconds and TimeZone info are optional)
    //
    var TF;
    if ( TF = new RegExp("^" + Yr + "(?:" + Mo + "(?:" + Dy + ")?)?" + "$").exec(CurDate) ) {} else if ( TF = new RegExp("^" + Yr + Mo + Dy + "[Tt ]" + Hr + Mn + Sd + TZ + "$").exec(CurDate) ) {};
        
    // If the date couldn't be parsed, return null
    //
    if ( !TF ) { return null };

    // Default the Time Fragments if they're not present
    //
    if ( !TF[2] ) { TF[2] = 1 } else { TF[2] = TF[2] - 1 };
    if ( !TF[3] ) { TF[3] = 1 };
    if ( !TF[4] ) { TF[4] = 0 };
    if ( !TF[5] ) { TF[5] = 0 };
    if ( !TF[6] ) { TF[6] = 0 };
    if ( !TF[7] ) { TF[7] = 0 };
    if ( !TF[8] ) { TF[8] = null };
    if ( TF[9] != "-" && TF[9] != "+" ) { TF[9] = null };
    if ( !TF[10] ) { TF[10] = 0 } else { TF[10] = TF[9] + TF[10] };
    if ( !TF[11] ) { TF[11] = 0 } else { TF[11] = TF[9] + TF[11] };

    // If there's no timezone info the data is local time
    //
    if ( !TF[8] && !TF[9] ) {
        return new Date(TF[1], TF[2], TF[3], TF[4], TF[5], TF[6], TF[7]);
    };

    // If the UTC indicator is set the date is UTC
    //
    if ( TF[8] == "Z" ) {
        return new Date(Date.UTC(TF[1], TF[2], TF[3], TF[4], TF[5], TF[6], TF[7]));
    };
    
    // If the date has a timezone offset
    //
    if ( TF[9] == "-" || TF[9] == "+" ) {

        // Get current Timezone information
        //
        var CurTZ = new Date().getTimezoneOffset();
        var CurTZh = TF[10] - ((CurTZ >= 0 ? "-" : "+") + Math.floor(Math.abs(CurTZ) / 60))
        var CurTZm = TF[11] - ((CurTZ >= 0 ? "-" : "+") + (Math.abs(CurTZ) % 60))

        // Return the date
        //
        return new Date(TF[1], TF[2], TF[3], TF[4] - CurTZh, TF[5] - CurTZm, TF[6], TF[7]);
    };

    // If we've reached here we couldn't deal with the input, return null
    //
    return null;
};