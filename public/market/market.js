var user;
var userKey;
var name;
var weekIndex;
var monthIndex;
var total;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        firebase.database().ref("master/").once('value').then(function(master) {
            if (!(master.val().market))
                window.location = "https://gnomestocks.com/";  
            getDataAndValidate();
        });
    } else {
        window.location = "https://gnomestocks.com/auth/auth.html";  
    }
});

var getDataAndValidate = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        document.getElementsByTagName("Master")[1].innerHTML = monthIndex;
    });
    firebase.database().ref("user/").once('value').then(function(users) {
        for (u in users.val()) {
            (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr){
                    if (usr.val().email === firebase.auth().currentUser.email) {
                        userKey = u;
                        name = usr.val().name;
                        total = usr.val().total;
                        document.getElementsByTagName("Master")[0].innerHTML = dollarString(total); // TODO: Include change and shit
                        document.getElementsByTagName("Tom")[1].innerHTML = usr.val().shares.Tom;
                        document.getElementsByTagName("Alex")[1].innerHTML = usr.val().shares.Alex;
                        document.getElementsByTagName("Mac")[1].innerHTML = usr.val().shares.Mac;
                        document.getElementsByTagName("Jack")[1].innerHTML = usr.val().shares.Jack;
                        console.log(changeString(521, 478));
                    }
                    document.getElementsByTagName(usr.val().name)[0].innerHTML = dollarString(usr.val().price);
                });
            })(u);
        }
    });
    displayLoadedPage();
}

var displayLoadedPage = function() {
    document.getElementById("loading").style = "display: none";
    document.getElementById("loaded").style = "display: lol";
}

var minus = function(stock) {
    console.log("-" + stock);
}

var plus = function(stock) {
    console.log("-" + stock);
}

var dollarString = function(num) {
    num = "" + num;
    if (num.length === 1) return "0.0" + num;
    if (num.length === 2) return "0." + num;
    return num.slice(0,num.length - 2) + "." + num.slice(-2);
}

var changeString = function(oldNum, newNum) {
    var diff = newNum - oldNum;
    var r =  "+$";
    if (diff < 0) {
        r = "-$";
        diff = -diff;
    }
    return r + dollarString(diff) + " (" + roundTwoDisplayString(100*Math.abs(diff)/oldNum) + "%)";
}

var roundTwoDecimal = function(num) {
    numString = "" + num;
    var dIndex = numString.indexOf('.');
    if (dIndex === -1) return num;
    if (numString.length - 3 <= dIndex) {
        return parseFloat(numString);
    }
    numString = "" + numString.slice(0, dIndex + 1) + numString.slice(dIndex + 1, dIndex + 3);
    return parseFloat(numString);
}

var roundTwoDisplayString = function(num) {
    num = "" + roundTwoDecimal(num); 
    var dIndex = num.indexOf('.');
    if (dIndex === -1) return num + ".00";
    while (num.length - 3 < dIndex) num += "0";
    return num;
}

// validate (buying power, self limit, can't sell at 0)
// update buying power
// update # shares 
//
// As side note, remember to display total portfolio value
// Also let's update the history on market close
