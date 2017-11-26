var user;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        // $("h1").text("Hello, " + u.displayName + "!"); display names will need to be filled in later...
        if (u.email != "tom@tom.tom")
            window.location = "https://gnomestocks.com/";
        displayLoadedPage();
        start(u);
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});


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
