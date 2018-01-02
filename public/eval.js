var user;
var u;
var userKey;
var name;
var weekIndex;
var monthIndex;
var wHigh;
var wLow;
var weekRatings;
var weekAverage = 0;
var monthString;
var wekString;
var wait = false;
var safari = true;

// Logic for /monthly and /weekly. /daily is in daily/daily.js


//firebase.auth().onAuthStateChanged(function(u) {
//   safari = false; 
//   start(u);
//});

$(document).ready(function() {
    var loggedInUser = firebase.auth().currentUser;
    setTimeout(function() {
        if (safari) start(loggedInUser);
    }, 5000);
});

var start = function(u) {
    u = firebase.auth().currentUser;
    if (u) {
        user = u;
        var loc = window.location.href;
        var weekTemplate = (loc.slice(-7) === "weekly/");
        firebase.database().ref("master/").once('value').then(function(master) {
            if ((weekTemplate && !(master.val().weekly)) || (!weekTemplate && !master.val().monthly))
                home();
            getDataAndValidate(weekTemplate);
            start(u);
        });
    } else {
        //window.location = "https://gnomestocks.com/auth/";  
    }
}

var getDataAndValidate = function(weekTemplate) {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        wHigh = master.val().wHigh;
        wLow = master.val().wLow;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
        firebase.database().ref("master/monthNames").once("value").then(function(months) {
            for (var mon in months.val()) (function(mon) {
                firebase.database().ref("master/monthNames/" + mon).once("value").then(function(m) {
                    var moveOn = false;
                    if (m.val().month === monthIndex && !weekTemplate) {
                        moveOn = true;
                        monthString = m.val().name;
                        document.getElementById("header").innerHTML = monthString;
                    }
                    if (m.val().month === (monthIndex + 1) && weekTemplate) {
                        moveOn = true;
                        weekString = m.val().name + " - Week " + (weekIndex - wHigh);
                        document.getElementById("header").innerHTML = weekString;
                    }
                    if (moveOn) gdavp2(weekTemplate);
                });
            })(mon);
        });
    });
}

var gdavp2 = function(weekTemplate) {
    firebase.database().ref("user/").once('value').then(function(users) {
        for (u in users.val()) {
            (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr){
                    if (usr.val().email === firebase.auth().currentUser.email) {
                        userKey = u;
                        name = usr.val().name;
                        if (weekTemplate) {
                            for (var w in usr.val().weekly) {
                                (function(w) {
                                    firebase.database().ref("user/" + u + "/weekly/" + w + "/week").once("value").then(function(i) {
                                        if (i.val() === weekIndex) {
                                            alert("You have already submitted an evaluation for " + weekString);
                                            home();
                                        }
                                    });
                                })(w);
                            }
                            dailyRatings = "";
                            var count = 0;
                            for (var d in usr.val().daily) count++;
                            for (var d in usr.val().daily) (function(d) {
                                count--;
                                firebase.database().ref("user/" + u + "/daily/" + d).once("value").then(function(i) {
                                    dailyRatings += "<br>" + i.val();
                                    if (count == 0) {
                                        document.getElementById("dailyRatings").innerHTML = "For reference, here are the daily ratings you have self-reported this week: <b>"
                                            + dailyRatings + "</b>";
                                    }
                                });
                            })(d);
                        } else {
                            document.getElementById(usr.val().name).style = "display: none";
                            for (var m in usr.val().monthly) {
                                (function(m) {
                                    firebase.database().ref("user/" + u + "/monthly/" + m + "/month").once("value").then(function(i) {
                                        if (i.val() === monthIndex) {
                                            alert("You have already submitted an evaluation for " + monthString);
                                            home();
                                        }
                                    });
                                })(m);
                            }
                            weekRatings = "";
                            var count = 0;
                            for (var w in usr.val().weekly) count++;
                            for (var w in usr.val().weekly) {
                                count--;
                                (function(w, count, length) {
                                    firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(i) {
                                        if (i.val().week >= wLow && i.val().week <= wHigh)
                                            weekRatings += "<br>Week: " + (i.val().week - wLow + 1) + ": " + i.val().rating;
                                            weekAverage += i.val().rating;
                                        if (count == 0) {
                                            document.getElementById("weekRatings").innerHTML = "For reference, here are the weekly ratings you have self-reported this month: <b>"
                                                + weekRatings + "</b>";
                                        }
                                    });
                                })(w, count, length);
                            }
                        }
                    }
                    displayLoadedPage();
                });
            }(u));
        }   
    });
};

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var home = function() {
    window.location = "https://gnomestocks.com/";  
}

var submitWeekly = function() {
    if (wait) return;
    var rating = document.getElementById("rating").value;
    if (!isNaN(rating) && isFinite(rating) && rating >= 0 && rating <= 100) {
        firebase.database().ref("user/" + userKey + "/weekly").push({
            "week" : weekIndex,
            "rating" : parseInt(rating, 10)
        }).then(function() {
            firebase.database().ref("user/" + userKey + "/daily").remove().then(function() {
                var count = 0;
                var userCount = 0;
                firebase.database().ref("user/").once("value").then(function(users) {
                    for (var u in users.val()) (function(u) {
                        firebase.database().ref("user/" + u + "/weekly").once("value").then(function(weekData) {
                            userCount++;
                            var weekCount = 0;
                            if (userCount === 4)
                                for (var w in weekData.val()) weekCount++;
                            for (var w in weekData.val()) (function(w, userCount) {
                                firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(i) {
                                    if (i.val().week == weekIndex) {
                                        count++;
                                        if (count === 4) {
                                            firebase.database().ref("master/").update({"weekly" : false});
                                       }
                                    }
                                    weekCount--;
                                    if (weekCount === 0) {
                                        wait = false;
                                        alert("You have successfully entered your weekly rating");
                                        home();
                                    }
                                });
                            })(w, userCount);
                        }); 
                    })(u);
                });
            });
        });
    } else {
        document.getElementById("error").style = "display: lol; color: red";
        wait = false;
    }
}

var submitMonthly = function() {
    if (wait) return;
    wait = true;
    var postData = {};
    var error = false;
    var ratings = document.getElementsByTagName("input");
    var selfRating = parseInt(ratings[0].value, 10);
    postData["rating"] = selfRating;
    postData["weekAverage"] = weekAverage / (wHigh - wLow + 1);
    if (isNaN(selfRating) || !isFinite(selfRating) || selfRating < 0 || selfRating > 100) {
        document.getElementById("error").style = "display: lol";
        error = true;
        wait = false;
    }
    for (var i = 1; i < ratings.length; i++) {
        if (ratings[i].id === name + "Rating") continue;
        var rating = parseInt(ratings[i].value);
        postData[ratings[i].id] = rating;
        if (isNaN(rating) || !isFinite(rating) || rating < 0 || rating > 10) {
            document.getElementById("error").style = "display: lol";
            error = true;
        }
    }
    if (error)
        document.getElementById("error").style = "display: lol; color: red";
    else {
        postData["month"] = monthIndex;
        firebase.database().ref("user/" + userKey + "/monthly").push(postData).then(function() {
            wait = false;
            alert("Successfully recorded monthly evaluation");
            window.location = "https://gnomestocks.com/"
        });
        // TODO later on: check if it's time to open the markets or at least close monthly evals 
    }
}

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}
