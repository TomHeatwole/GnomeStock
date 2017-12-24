var user;
var userKey;
var weekIndex;
var monthIndex;
var userData;
var masterData;
var shares;
var bp;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        if (document.getElementsByTagName("h1")[0].innerHTML.charAt(0) === 'H') {
            $("h1").text("Hello, " + u.displayName + "!");
            getMasterValues();
        }
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
                    if (usr.val().name === user.displayName) {
                        shares = usr.val().shares;
                        bp = usr.val().bp;
                    }
                    count++;
                    var data = {
                        "name" : usr.val().name,
                        "price" : usr.val().price,
                        "total" : usr.val().total,
                        "ticker" : usr.val().ticker
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
    populatePortfolio();
}

var populatePortfolio = function() {
    var userIndex = 0;
    var orderUserData = [];
    orderUserData.push({value : -1});
    for (var i = 0; i < 4; i++) {
        var value = userData[i].price * shares[userData[i].name];
        userData[i].value = value;
        if (userData[i].name === user.displayName) userIndex = i;
        var row = document.createElement("tr");
        var stockName = document.createElement("a");
        stockName.href = "https://gnomestocks.com/stocks/" + userData[i].name.toLowerCase();
        stockName.appendChild(document.createTextNode(userData[i].ticker));
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        td1.appendChild(stockName);
        td2.appendChild(document.createTextNode(shares[userData[i].name]));
        td3.appendChild(document.createTextNode("$" + dollarString(value)));
        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        document.getElementById("portfolioTable").appendChild(row);
        for (var j = 0; j < orderUserData.length; j++)
            if (value >= orderUserData[j].value) {
                orderUserData.splice(j, 0, userData[i]);
                break;
            }
    }
    userData = orderUserData;
    var bpRow = document.createElement("tr");
    var bp1 = document.createElement("td");
    var bp2 = document.createElement("td");
    var bp3 = document.createElement("td");
    bp1.innerHTML = "Uninvested";
    bp3.innerHTML = "$" + dollarString(bp);
    bpRow.appendChild(bp1);
    bpRow.appendChild(bp2);
    bpRow.appendChild(bp3);
    var totalRow = document.createElement("tr");
    totalRow.style = "font-weight: bold";
    var totalTd1 = document.createElement("td");
    var totalTd2 = document.createElement("td");
    var totalTd3 = document.createElement("td");
    totalTd1.appendChild(document.createTextNode("Total"));
    //totalTd2.appendChild(document.createTextNode(totalShares));
    totalTd3.appendChild(document.createTextNode("$" + dollarString(userData[userIndex].total)));
    totalRow.appendChild(totalTd1);
    totalRow.appendChild(totalTd2);
    totalRow.appendChild(totalTd3);
    document.getElementById("portfolioTable").appendChild(bpRow);
    document.getElementById("portfolioTable").appendChild(totalRow);
    if (bp !== 0) {
        for (var i = 0; i < 4; i++)
            if (bp > userData[i].value) {
                userData.splice(i, 0, {
                    value : bp,
                    ticker: "Uninvested"
                });
                break;
            }
    }
    var chartDataPoints = [];
    for (var i = 0; i < 5; i++) {
        if (shares[userData[i].name] !== 0)
            chartDataPoints.push({
                y : 100 * userData[i].value / userData[userIndex].total,
                label: userData[i].ticker
            });
    }
    var chart = new CanvasJS.Chart("chartContainer", {
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: chartDataPoints
        }],
        backgroundColor: "#e8e8e8",
        animationEnabled: true,
        height: 301 
    });
    chart.render();
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
