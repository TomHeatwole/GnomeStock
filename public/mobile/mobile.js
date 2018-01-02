var masterData;
var weekIndex;
var monthIndex;
var wait = false;

$(document).ready(function() {
    firebase.database().ref("master").once("value").then(function(master) {
        masterData = master.val();
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
        if (masterData.weekly)
            document.getElementById("weeklyForm").style = "dipslay: lol";
        else if (masterData.monthly)
            document.getElementById("monthlyForm").style = "display: lol";
        else
            document.getElementById("dailyForm").style = "display: lol";
        displayLoadedPage();
    });
});


var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var submitDaily = function() {
    if (wait) return;
    wait = true;
    var rating = document.getElementById("dailyRating").value;
    var pin = document.getElementById("dailyPin").value;
    var foundPin = false;
    var count = 0;
    firebase.database().ref("user").once("value").then(function(users) {
        for (var u in users.val()) (function(u) {
            firebase.database().ref("user/" + u).once("value").then(function(usr) {
                if (usr.val().pin === pin) {
                    foundPin = true;
                    if (!isNaN(rating) && isFinite(rating) && rating >= 0 && rating <= 100 && rating !== "") {
                        firebase.database().ref("user/" + u + "/daily").push(rating).then(function() {
                            alert("You have successfully entered your daily rating");
                            home();
                        });
                    } else {
                        document.getElementById("error").style = "display: lol; color: red";
                        wait = false;
                    }
                }
                count++;
                if (count === 4 && !foundPin) {
                    alert("Pin does not match any user");
                    wait = false;
                }
            });
        })(u);
    });
}

var submitWeekly = function() {
    if (wait) return;
    wait = true;
    var rating = document.getElementById("weeklyRating").value;
    var pin = document.getElementById("weeklyPin").value;
    var foundPin = false;
    var count = 0;
    firebase.database().ref("user").once("value").then(function(users) {
        for (var u in users.val()) (function(u) {
            firebase.database().ref("user/" + u).once("value").then(function(usr) {
                if (usr.val().pin === pin) {
                    foundPin = true;
                    var weekCount = 0;
                    var cont = true;
                    for (var w in usr.val().weekly) weekCount++;
                    for (var w in usr.val().weekly) (function(w) {
                        firebase.database().ref("user/" + u + "/weekly/" + w).once("value").then(function(week) {
                            if (week.val().week === weekIndex) {
                                cont = false;
                                alert("You already entered a weekly evaluation for this week");
                                home();
                            }
                        });
                        weekCount--;
                        if (weekCount === 0 && cont) {
                            if (!isNaN(rating) && isFinite(rating) && rating >= 0 && rating <= 100 && rating !== "") {
                                firebase.database().ref("user/" + u + "/weekly").push({
                                    week: weekIndex,
                                    rating: parseInt(rating)
                                }).then(function() {
                                    alert("You have successfully entered your weekly rating");
                                    home();
                                });
                            } else {
                                wait = false;
                                document.getElementById("error").style = "display: lol; color: red";
                            }
                        }
                    })(w);
                }
                count++;
                if (count === 4 && !foundPin) {
                    wait = false;
                    alert("Pin does not match any user");
                }
            });
        })(u);
    });
}

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}

var home = function() {
    window.location = "https://gnomestocks.com/";  
}
