var auth = {
    user: firebase.auth().currentUser, 
    signedIn: !(this.user == null),
    authenticate: function() {
        firebase.auth().signInWithEmailAndPassword(
            document.getElementById("email").value, 
            document.getElementById("password").value
        ).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
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
        //TODO: Validations (ESPECIALLY The code)
        firebase.auth().createUserWithEmailAndPassword(
            document.getElementById("newEmail").value, 
            document.getElementById("newPassword").value
        ).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        });
    }
};

if (auth.signedIn) document.write("You are signed in :D");
