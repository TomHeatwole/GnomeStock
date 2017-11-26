var user;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        var loc = window.location.href
        firebase.database().ref("master/").once('value').then(function(master) {
            if (loc.slice(-11) === "weekly.html" && !(master.val().weekly))
                home();
            if (loc.slice(-12) === "monthly.html" && !(master.val().monthly))
                home();
            displayLoadedPage();
            start(u);
        });
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
    window.location = "https://gnomestocks.com/";  
}

var submitWeekly = function() {
    var rating = document.getElementById("rating").value;
    if (!isNaN(parseFloat(rating)) && isFinite(rating) && rating >= 0 && rating <= 100) {
        firebase.database().ref("user/").once('value').then(function(users) {
            for (u in users.val()) {
                (function(u) {
                    firebase.database().ref("user/" + u).once("value").then(function(usr){
                        if (usr.val().email === firebase.auth().currentUser.email)
                            console.log(u);
                    });
                }(u));
            }
        });
    } else
        document.getElementById("error").style = "display: lol";
}

var submitMonthly = function() {
}
