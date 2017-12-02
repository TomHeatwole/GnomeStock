var user;
var userKey;
var weekIndex;
var monthIndex;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        var loc = window.location.href
        var weekTemplate = (loc.slice(-11) === "weekly.html");
        firebase.database().ref("master/").once('value').then(function(master) {
            if ((weekTemplate && !(master.val().weekly)) || (!weekTemplate && !master.val().monthly))
                home();
            getMasterValues();
            getUserKeyAndValidate(weekTemplate);
            displayLoadedPage();
            start(u);
        });
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});

var getMasterValues = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
    });
}

var getUserKeyAndValidate = function(weekTemplate) {
    firebase.database().ref("user/").once('value').then(function(users) {
        for (u in users.val()) {
            (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr){
                    if (usr.val().email === firebase.auth().currentUser.email) {
                        userKey = u;
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
                        }
                    }
                });
            }(u));
        }
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
    if (!isNaN(parseInt(rating)) && isFinite(rating) && rating >= 0 && rating <= 100) {
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
    if (!validateMonthly()) return;
    var postData = {};
    postData["rating"] = rating;
    var error = false;
    firebase.database().ref("user/").once("value").then(function(users) {
        for (var u in users.val()) (function(u) {
            if (u === userKey)
                return;
            firebase.database().ref("user/usr1").once("value").then(function(usr) {
                console.log(usr.val());
                var usrRating = document.getElementById(usr.val().name).value;
                if (isNaN(parseInt(usrRating)) || !isFinite(usrRating) || usrRating < 0 || usrRating > 10)
                    error = true;
                postData[usr.val().name] = usrRating;
            });
        })(u);
    });
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

var validateMonthly = function() {
    var ratings = document.getElementsByTagName("inpput");
    var selfRating = ratings[0].value;
    if (isNaN(parseInt(selfRating) || !isFinite(selfRating) || selfRating < 0 || selfRating > 100) {
        document.getElementById("error").style = "display: lol";
        return false;
    }
    for (int i = 1; i < ratings.length; i++) {
        var rating = ratings[i].value;
        if (isNaN(parseInt(selfRating) || !isFinite(selfRating) || selfRating < 0 || selfRating > 100) {
            document.getElementById("error").style = "display: lol";
            return false;
        }
    }
    return true;
}


// ISSUES:
// Not stopping user from entering second monthly eval
// .then on line 115 not excecuting?













