var user;
var userKey;
var name;
var weekIndex;
var monthIndex;
var total;
var wait = false;
var prices = {};
var historyData = {"Tom":{}, "Alex":{}, "Jack":{}, "Mac":{}};

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        firebase.database().ref("master/").once('value').then(function(master) {
            getHistory();
        });
    } else {
        window.location = "https://gnomestocks.com/auth/";  
    }
});

var getHistory = function() {
    firebase.database().ref("user/").once("value").then(function(users) {
        var count = 0;
        for (var u in users.val()) (function(u) {
            firebase.database().ref("user/" + u).once("value").then(function(usr) {
                firebase.database().ref("user/" + u + "/history/").once("value").then(function(his) {
                count++;
                    for (var h in his.val()) (function(h) {
                        firebase.database().ref("user/" + u + "/history/" + h).once("value").then(function(i) {
                            historyData[usr.val().name][i.val().month] = i.val();
                        });
                    })(h);
                    if (count === 4) getDataAndValidate();
                });
            });
        })(u);
    });
}

var getDataAndValidate = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
    });
    displayLoadedPage();
}

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}
