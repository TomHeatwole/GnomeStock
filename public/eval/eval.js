var user;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        // $("h1").text("Hello, " + u.displayName + "!"); display names will need to be filled in later...
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

