var user;
var userKey;
var weekIndex;
var monthIndex;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        getMasterValues();
        $("h1").text("Hello, " + u.displayName + "!");
        start(u);
        getMasterValues();
    } else {
        window.location = "https://gnomestocks.com/auth/";  
    }
});

var getMasterValues = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
        displayLoadedPage();
    });
}       

var signOut = function() {
    firebase.auth().signOut().catch(function(e) {
       alert(e.messge); 
    });
}

var displayLoadedPage = function() {
    if (window.location.href.includes("404") || window.location.href.includes("rules")) return;
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var start = function(user) {

}
