var user;
var userKey;
var name;
var weekIndex;
var monthIndex;
var total;
var wait = false;
var prices = {};

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
        document.getElementsByTagName("Master")[3].innerHTML = monthIndex;
    });
    firebase.database().ref("user/").once('value').then(function(users) {
        for (u in users.val()) {
            (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr){
                    if (usr.val().email === firebase.auth().currentUser.email) {
                        userKey = u;
                        name = usr.val().name;
                        total = usr.val().total;
                        var masterTags = document.getElementsByTagName("Master");
                        masterTags[4].innerHTML = dollarString(usr.val().bp);
                        masterTags[1].innerHTML = dollarString(total);
                        populateChangeString(9824, total, masterTags[2], masterTags[0]);
                        document.getElementsByTagName("Tom")[3].innerHTML = usr.val().shares.Tom;
                        document.getElementsByTagName("Tom")[3].style.color = document.getElementsByTagName("Tom")[2].style.color;
                        document.getElementsByTagName("Alex")[3].innerHTML = usr.val().shares.Alex;
                        document.getElementsByTagName("Mac")[3].innerHTML = usr.val().shares.Mac;
                        document.getElementsByTagName("Jack")[3].innerHTML = usr.val().shares.Jack;
                    }
                    var usrTags = document.getElementsByTagName(usr.val().name);
                    usrTags[1].innerHTML = dollarString(usr.val().price);
                    populateChangeString(500, usr.val().price, usrTags[2], usrTags[0]);
                    prices[usr.val().name] = usr.val().price;
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
    if (wait) return;
    wait = true;
    var e = document.getElementsByTagName(stock)[3];
    var current = parseInt(e.innerHTML);
    e.innerHTML = current - 1;
    var e2 = document.getElementsByTagName("master")[4];
    var bp = dollarsToCents(e2.innerHTML) + prices[stock];
    e2.innerHTML = dollarString(bp);
    if (current == 0) {
        wait = false;
        alert("You have no shares to sell");
        return;
    }
    firebase.database().ref("user/" + userKey + "/shares/" + stock).set(current - 1).then(function() {
        firebase.database().ref("user/" + userKey + "/bp").set(bp).then(function() {
            firebase.database().ref("user/" + userKey + "/changes/" + stock).transaction(function(c){
                wait = false;
                return c - 1;
            });
        });
    });
}

var plus = function(stock) {
    if (wait) return;
}

// validate (buying power, self limit)
// update buying power
// update # shares 
// update changes
//
// Also let's update the history (including changes) on market close

var dollarString = function(num) {
    num = "" + num;
    if (num.length === 1) return "0.0" + num;
    if (num.length === 2) return "0." + num;
    return num.slice(0,num.length - 2) + "." + num.slice(-2);
}

var dollarsToCents = function(d) {
    var dot = d.indexOf('.');
    var dollar = parseInt(d.slice(0,dot));
    var cent = parseInt(d.slice(dot + 1));
    return dollar * 100 + cent;
}

var populateChangeString = function(oldNum, newNum, e, e2) {
    var cS = changeString(oldNum, newNum);
    e.style.color = (cS.indexOf('-') === -1) ? "green" : "red";
    e.innerHTML = cS;
    if (e2 != undefined) {
        e2.style.color = e.style.color
        e2.innerHTML = (cS.indexOf('-') === -1) ? '<i class="fa fa-long-arrow-up" aria-hidden="true">' : '<i class="fa fa-long-arrow-down" aria-hidden="true">';
    }
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

