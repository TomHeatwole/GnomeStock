var user;
var weekIndex;
var monthIndex;
var weekly;
var monthly;
var marketOpen;
var wLow;
var wHigh;
var losers = {};

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        // $("h1").text("Hello, " + u.displayName + "!"); display names will need to be filled in later...
        if (u.email != "tom@tom.tom")
            window.location = "https://gnomestocks.com/";
        getMasterValues();
        start(u);
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});

var getMasterValues = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        weekly = master.val().weekly;
        monthly = master.val().monthly;
        marketOpen = master.val().market;
        wLow = master.val().wLow;
        wHigh = master.val().wHigh;
        document.getElementById("startWeek").innerHTML = "Start Week " + (weekIndex + 1);
        document.getElementById("endWeek").innerHTML = "End Week " + weekIndex;
        document.getElementById("startMonth").innerHTML = "Start Month " + (monthIndex + 1);
        document.getElementById("endMonth").innerHTML = "End Month " + monthIndex;
        if (weekly)
            document.getElementById("endWeek").style = "display: lol";
        else
            document.getElementById("startWeek").style = "display: lol";
        if (monthly)
            document.getElementById("endMonth").style = "display: lol";
        else
            document.getElementById("startMonth").style = "display: lol";
        if (marketOpen)
            document.getElementById("stopTrading").style = "display: lol";
        else
            document.getElementById("startTrading").style = "display: lol";

        if (weekly)
            firebase.database().ref("user/").once("value").then(function(users) {
                for (var u in users.val())
                    (function(u){firebase.database().ref("user/" + u).once("value").then(function(usr) {
                        losers[usr.val().name] = true;
                        for (var w in usr.val().weekly)
                            firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(i) {
                                if (i.val().week === weekIndex)
                                    losers[usr.val().name] = false;
                            });
                    });})(u);
            });
        if (monthly)
            firebase.database().ref("user/").once("value").then(function(users) {
                for (var u in users.val())
                    (function(u){firebase.database().ref("user/" + u).once("value").then(function(usr) {
                        losers[usr.val().name] = true;
                        for (var m in usr.val().monthly)
                            firebase.database().ref("user/" + u + "/monthly/" + m).once("value").then(function(i) {
                                if (i.val().month === monthIndex)
                                    losers[usr.val().name] = false;
                            });
                    });})(u);
            });

        displayLoadedPage();
    });
}

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var start = function(user) {

}

var home = function() {
    window.location = "https://gnomestocks.com/auth/auth.html";
}

var startWeek = function() {
    firebase.database().ref("master/").update({
        "week" : (weekIndex + 1),
        "weekly" : true
    }).then(function() {
        alert("Now accepting evals for week " + (weekIndex + 1));
        window.location.reload();
    });
}

var endWeek = function() {
    firebase.database().ref("master/").update({
        "weekly" : false 
    }).then(function() {
        alert("No longer accepting evals for week " + weekIndex);
        window.location.reload();
    });
}

var startMonth = function() {
    firebase.database().ref("master/").update({
        "monthly" : true,
        "month" : (monthIndex + 1),
        "wLow" : (wHigh + 1),
        "wHigh" : weekIndex
    }).then(function() {
        alert("Now accepting evals for month " + (monthIndex + 1));
        window.location.reload();
    });
}

var endMonth = function() {
    firebase.database().ref("master/").update({
        "monthly" : false 
    }).then(function() {
        alert("No longer accepting evals for month " + monthIndex);
        window.location.reload();
    });
}


var submit = function() {
    var perms = document.getElementsByTagName("input"); // weekly, monthly, trading
    firebase.database().ref().update({
        "/master/weekly" : perms[0].checked,
        "/master/monthly" : perms[1].checked,
        "/master/market-open" : perms[2].checked
    }).then(function() {
        document.getElementById("successMessage").style = "display: lol";
    });
}

var showLosers = function() {
    var loserString = "";
    for (var key in losers) if (losers[key]) loserString += key + " ";
    document.getElementById("losers").innerHTML = loserString;
}
