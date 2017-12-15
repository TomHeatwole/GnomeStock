var user;
var userKey;
var name;
var weekIndex;
var monthIndex;
var wHigh;
var wLow;
var dayRatings;
var monthString;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        getData();
    } else {
        window.location = "https://gnomestocks.com/auth/";  
    }
});

var getData = function() {
    firebase.database().ref("master/").once('value').then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
    });
    firebase.database().ref("user/").once('value').then(function(users) {
        for (u in users.val()) {
            (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr){
                    if (usr.val().email === firebase.auth().currentUser.email) {
                        userKey = u;
                        name = usr.val().name;
                        displayLoadedPage();
                    }
                });
            })(u);
        }
    });
}

var home = function() {
    window.location = "https://gnomestocks.com/";  
}

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var submit = function() {
    var rating = document.getElementById("rating").value;
    if (!isNaN(rating) && isFinite(rating) && rating >= 0 && rating <= 100) {
        firebase.database().ref("user/" + userKey + "/daily").push(rating).then(function() {
            alert("You have successfully entered your daily rating");
            home();
        });
    } else
        document.getElementById("error").style = "display: lol; color: red";
}

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}
