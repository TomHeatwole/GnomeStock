var user;
var userKey;
var weekIndex;
var monthIndex;
var userData;
var masterData;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        getMasterValues();
        if (!window.location.href.includes("rules"))
            $("h1").text("Hello, " + u.displayName + "!");
        start(u);
    } else {
        window.location = "https://gnomestocks.com/auth/";  
    }
});

var getMasterValues = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        masterData = master.val();
        weekIndex = master.val().week;
        monthIndex = master.val().month;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
        if (window.location.href.includes("404") || window.location.href.includes("rules")) return;
        firebase.database().ref("user/").once("value").then(function(users) {
            var count = 0;
            userData = [];
            userData.push({"total" : -1}); // dummy value to make sorting easier
            for (var u in users.val()) (function(u) {
                firebase.database().ref("user/" + u).once("value").then(function(usr) {
                    count++;
                    var data = {
                        "name" : usr.val().name,
                        "price" : usr.val().price,
                        "total" : usr.val().total
                    }
                    for (var h in usr.val().history) (function(h) {
                        firebase.database().ref("user/" + u + "/history/" + h).once("value").then(function(history) {
                            if ((masterData.monthly && history.val().month === (monthIndex - 2)) ||
                            (!masterData.monthly && history.val().month === (monthIndex - 1))) {
                                data["pPrice"] = history.val().price;
                                data["pTotal"] = history.val().total;
                                for (var i = 0; i < userData.length; i++)
                                    if (data.total >= userData[i].total) {
                                        userData.splice(i, 0, data);
                                        break;
                                    }
                                if (userData.length === 5) {
                                    populateStandings();
                                }
                            }
                        });
                    })(h);
                });
            })(u);
        });
    });
}       

var populateStandings = function() {
    if (window.location.href.includes("404") || window.location.href.includes("rules")) return;
    var tie = -1;
    for (var i = 0; i < 4; i++) {
        var row = document.createElement("tr");
        if (user.displayName === userData[i].name) row.style = "background-color: #FDFFC0";
        var place = (tie === -1) ? i + 1 : tie;
        tie = (userData[i].total === userData[i + 1].total) ? place : -1;
        var placeElement = document.createElement("td");
        var nameElement = document.createElement("td");
        var priceElement = document.createElement("td");
        var totalElement = document.createElement("td");
        //<Tom>SECOND PARAM</Tom> <b>$<Tom>PRICE</Tom></b> <Tom>FIRST PARAM</Tom><br>
        var p1 = document.createElement(userData[i].name);
        var p2 = document.createElement(userData[i].name);
        var t1 = document.createElement(userData[i].name);
        var t2 = document.createElement(userData[i].name);
        var t3 = document.createElement(userData[i].name);
        t2.style = "font-weight: bold";
        t2.innerHTML = " $" + dollarString(userData[i].total) + " ";
        populateChangeString(userData[i].pPrice, userData[i].price, p2, p1);
        populateChangeString(userData[i].pTotal, userData[i].total, t3, t1);
        priceElement.appendChild(p1);
        priceElement.appendChild(document.createTextNode(" $" + dollarString(userData[i].price) + " "));
        priceElement.appendChild(p2);
        totalElement.appendChild(t1);
        totalElement.appendChild(t2);
        totalElement.appendChild(t3);
        placeElement.innerHTML = place + ".";
        nameElement.innerHTML = userData[i].name;
        row.appendChild(placeElement);
        row.appendChild(nameElement);
        row.appendChild(priceElement);
        row.appendChild(totalElement);
        document.getElementById("standings").appendChild(row);
    }
    displayLoadedPage();
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
