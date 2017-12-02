var user;
var userKey;
var name;
var weekIndex;
var monthIndex;
var wHigh;
var wLow;
var weekRatings;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        var loc = window.location.href
        var weekTemplate = (loc.slice(-11) === "weekly.html");
        firebase.database().ref("master/").once('value').then(function(master) {
            if ((weekTemplate && !(master.val().weekly)) || (!weekTemplate && !master.val().monthly))
                home();
            getDataAndValidate(weekTemplate);
            start(u);
        });
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});

var getDataAndValidate = function(weekTemplate) {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        wHigh = master.val().wHigh;
        wLow = master.val().wLow;
        firebase.database().ref("user/").once('value').then(function(users) {
            for (u in users.val()) {
                (function(u) {
                    firebase.database().ref("user/" + u).once("value").then(function(usr){
                        if (usr.val().email === firebase.auth().currentUser.email) {
                            userKey = u;
                            name = usr.val().name;
                            document.getElementById(usr.val().name).style = "display: none";
                            if (weekTemplate) {
                                for (var w in usr.val().weekly) {
                                    (function(w) {
                                        firebase.database().ref("user/" + u + "/weekly/" + w + "/week").once("value").then(function(i) {
                                            if (i.val() === weekIndex) {
                                                alert("You have already submitted an evaluation for week " + weekIndex);
                                                home();
                                            }
                                        });
                                    })(w);
                                }
                            } else {
                                for (var m in usr.val().monthly) {
                                    (function(m) {
                                        firebase.database().ref("user/" + u + "/monthly/" + m + "/month").once("value").then(function(i) {
                                            if (i.val() === monthIndex) {
                                                alert("You have already submitted an evaluation for month " + monthIndex);
                                                home();
                                            }
                                        });
                                    })(w);
                                }
                                weekRatings = "";
                                var count = 0;
                                for (var w in usr.val().weekly) count++;
                                for (var w in usr.val().weekly) {
                                    count--;
                                    (function(w, count, length) {
                                        firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(i) {
                                            if (i.val().week >= wLow && i.val().week <= wHigh)
                                                weekRatings += "<br>Week: " + i.val().week + ": " + i.val().rating;
                                            if (count == 0) {
                                                document.getElementById("weekRatings").innerHTML = "For reference, here are the weekly ratings you have self-reported this month: " + weekRatings;
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

var submitWeekly = function() {
    var rating = document.getElementById("rating").value;
    if (!isNaN(rating) && isFinite(rating) && rating >= 0 && rating <= 100) {
        firebase.database().ref("user/" + userKey + "/weekly").push({
            "week" : weekIndex,
            "rating" : rating
        }).then(function() {
            alert("You have successfully entered your weekly rating");
            home();
        });
    } else
        document.getElementById("error").style = "display: lol";
}

var submitMonthly = function() {
    var postData = {};
    var error = false;
    var ratings = document.getElementsByTagName("input");
    var selfRating = parseInt(ratings[0].value, 10);
    postData["rating"] = selfRating;
    if (isNaN(selfRating) || !isFinite(selfRating) || selfRating < 0 || selfRating > 100) {
        document.getElementById("error").style = "display: lol";
        error = true;
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
        document.getElementById("error").style = "display: lol";
    else {
        postData["month"] = monthIndex;
        firebase.database().ref("user/" + userKey + "/monthly").push(postData).then(function() {
            alert("Successfully recorded monthly evaluation");
            window.location = "https://gnomestocks.com/"
        });
        // TODO later on: check if it's time to open the markets or at least close monthly evals 
    }
}

