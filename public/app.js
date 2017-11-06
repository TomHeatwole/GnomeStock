var user;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});
