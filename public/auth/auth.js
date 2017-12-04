var auth = {
    authenticate: function() {
        firebase.auth().signInWithEmailAndPassword(
            document.getElementById("email").value, 
            document.getElementById("password").value
        ).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
    },
    displayCreateAccount: function() {
        document.getElementById("createAccount").style = "display: lol";
        document.getElementById("signIn").style = "display: none";
    },   
    displaySignIn: function() {
        document.getElementById("createAccount").style = "display: none";
        document.getElementById("signIn").style = "display: lol";
    },
    createAccount: function() {
        alert("Creating accounts is currently disabled");
        return;
        firebase.auth().createUserWithEmailAndPassword(
            document.getElementById("newEmail").value, 
            document.getElementById("newPassword").value
        ).then(function() {
            firebase.auth().currentUser.updateProfile({
                displayName: document.getElementById("name").value
            });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
    },
    changePassword: function() {
        var pass1 = document.getElementById("pass1").value;
        var pass2 = document.getElementById("pass2").value;
        document.getElementById("success").style = "display: none";
        if (pass1 != pass2) {
            alert("The passwords do not match.");
            return;
        }
        firebase.auth().currentUser.updatePassword(pass1).then(function() {
            document.getElementById("success").style = "display: lol";
        }).catch(function(e) {
            alert(e.message);
        });
    }
};

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        if (window.location != "https://gnomestocks.com/auth/changepassword.html")
            window.location = "https://gnomestocks.com/";
    } else {
        if (window.location === "https://gnomestocks.com/auth/changepassword.html")
            window.location = "https://gnomestocks.com/auth/";
    }
    displayLoadedPage();
});

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}
