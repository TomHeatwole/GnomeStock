;var user;
var name;
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
        window.location = "https://gnomestocks.com/auth/";  
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
        firebase.database().ref("master/monthNames").once("value").then(function(months) {
        document.getElementById("startWeek").innerHTML = "Start Week " + (weekIndex + 1);
        document.getElementById("endWeek").innerHTML = "End Week " + weekIndex;
        document.getElementById("startMonth").innerHTML = "Start Month " + (monthIndex + 1);
        document.getElementById("endMonth").innerHTML = "End Month " + monthIndex;
            for (var mon in months.val()) (function(mon) {
                firebase.database().ref("master/monthNames/" + mon).once("value").then(function(m) {
                    if (m.val().month === monthIndex)
                        document.getElementById("endMonth").innerHTML += " (" + m.val().name + ")";
                    if (m.val().month === (monthIndex + 1))
                        document.getElementById("startMonth").innerHTML += " (" + m.val().name + ")";
                });
            })(mon);
        });
        if (weekly)
            document.getElementById("endWeek").style = "display: lol";
        else
            document.getElementById("startWeek").style = "display: lol";
        if (monthly)
            document.getElementById("endMonthDiv").style = "display: lol";
        else
            document.getElementById("startMonth").style = "display: lol";
        if (marketOpen)
            document.getElementById("endTrading").style = "display: lol";
        else
            document.getElementById("startTrading").style = "display: lol";

        if (weekly)
            firebase.database().ref("user/").once("value").then(function(users) {
                for (var u in users.val())
                    (function(u) {
                        firebase.database().ref("user/" + u).once("value").then(function(usr) {
                            losers[usr.val().name] = true;
                            for (var w in usr.val().weekly)
                                firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(i) {
                                    if (i.val().week === weekIndex)
                                        losers[usr.val().name] = false;
                                });
                        });
                    })(u);
            });
        if (monthly)
            firebase.database().ref("user/").once("value").then(function(users) {
                for (var u in users.val())
                    (function(u) {
                        firebase.database().ref("user/" + u).once("value").then(function(usr) {
                            losers[usr.val().name] = true;
                            for (var m in usr.val().monthly)
                            firebase.database().ref("user/" + u + "/monthly/" + m).once("value").then(function(i) {
                                if (i.val().month === monthIndex)
                                    losers[usr.val().name] = false;
                                });
                        });
                    })(u);
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
    window.location = "https://gnomestocks.com/";
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
        firebase.database().ref("master/monthNames").push({
            "month" : (monthIndex + 1),
            "name" : document.getElementById("monthName").value
        }).then(function() {
            alert("No longer accepting evals for month " + monthIndex);
            window.location.reload();
        });
    });
}

var startTrading = function() {
    firebase.database().ref("master/").update({
        "market" : true
    }).then(function() {
        firebase.database().ref("user/").once("value").then(function(users) {
            var peerEvals = {
                "Tom" : 0,
                "Alex" : 0,
                "Jack" : 0,
                "Mac" : 0,
            };
            var monthRatings = {};
            var weekAverages = {};
            var count = 0;
            var prices = {};
            for (var u in users.val()) (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr) {
                    firebase.database().ref("user/" + u + "/changes/").update({
                        "Tom" : 0,
                        "Alex" : 0,
                        "Mac" : 0,
                        "Jack" : 0
                    }).then(function() {
                        firebase.database().ref("user/" + u + "/monthly/").once("value").then(function(months) {
                            for (var m in months.val()) (function(m) {
                                firebase.database().ref("user/" + u + "/monthly/" + m).once("value").then(function(i) {
                                    if (i.val().month === monthIndex) {
                                        count++; 
                                        peerEvals["Tom"] += (usr.val().name === "Tom") ? 0 : i.val().TomRating;
                                        peerEvals["Mac"] += (usr.val().name === "Mac") ? 0 : i.val().MacRating;
                                        peerEvals["Jack"] += (usr.val().name === "Jack") ? 0 : i.val().JackRating;
                                        peerEvals["Alex"] += (usr.val().name === "Alex") ? 0 : i.val().AlexRating;
                                        monthRatings[usr.val().name] = i.val().rating;
                                        weekAverages[usr.val().name] = i.val().weekAverage;
                                        if (count === 4) {
                                            count = 0;
                                            for (var u in users.val()) (function(u) {
                                                firebase.database().ref("user/" + u).once("value").then(function(usr) {
                                                    count++;
                                                    var totalRating = 0.5 * monthRatings[usr.val().name] + 3.5 * (peerEvals[usr.val().name] / 3) + 0.15 * weekAverages[usr.val().name];
                                                    prices[usr.val().name] = parseInt(100 * Math.pow(2, (totalRating / 25)), 10);
                                                    if (count === 4) {
                                                        count = 0;
                                                        for (var u in users.val()) (function(u) {
                                                            firebase.database().ref("user/" + u).once("value").then(function(usr) {
                                                                count++;
                                                                (function(data) {
                                                                    var bp = data.bp;
                                                                    console.log(bp);
                                                                    if (bp > 1000) bp = 1000 + parseInt(0.96 * (bp - 1000), 10);
                                                                    console.log(bp);
                                                                    var total = 0;
                                                                    total += prices["Tom"] * data.shares.Tom;
                                                                    total += prices["Mac"] * data.shares.Mac;
                                                                    total += prices["Jack"] * data.shares.Jack;
                                                                    total += prices["Alex"] * data.shares.Alex;
                                                                    total += bp;
                                                                    firebase.database().ref("user/" + u).update({
                                                                        "price" : prices[data.name],
                                                                        "bp" : bp,
                                                                        "total" : total
                                                                    });
                                                                    if (count == 4) {
                                                                        alert("You have updated scores and started trading");
                                                                        window.location.reload();
                                                                    }
                                                                })(usr.val());
                                                            });
                                                        })(u);
                                                    }
                                                });
                                            })(u);
                                        }
                                    }
                                }); 
                            })(m);
                        });
                    });
                });
            })(u);
        });
    });
}

var endTrading = function() {
    firebase.database().ref("master/").update({
        "market" : false
    }).then(function() {
        firebase.database().ref("user/").once("value").then(function(users) {
            for (var u in users.val())
                (function(u) {
                    firebase.database().ref("user/" + u).once("value").then(function(usr) {
                        firebase.database().ref("user/" + u + "/history/").push({
                            "month" : monthIndex,
                            "price" : usr.val().price,
                            "total" : usr.val().total,
                            "changes" : usr.val().changes
                        });
                    });
                })(u);
            alert("You have turned off trading");
            window.location.reload();
        });
    });
}

var submitManualPermissions = function() {
    var perms = document.getElementsByTagName("input"); // weekly, monthly, trading
    firebase.database().ref().update({
        "/master/weekly" : perms[1].checked,
        "/master/monthly" : perms[2].checked,
        "/master/market" : perms[3].checked
    }).then(function() {
        document.getElementById("successMessage").style = "display: lol";
    });
}

var showLosers = function() {
    var loserString = "";
    for (var key in losers) if (losers[key]) loserString += key + " ";
    document.getElementById("losers").innerHTML = loserString;
}
