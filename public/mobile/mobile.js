var masterData;
var weekIndex;
var monthIndex;

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
                    } else
                        document.getElementById("error").style = "display: lol; color: red";
                }
                count++;
                if (count === 4 && !foundPin) alert("Pin does not match any user");
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
