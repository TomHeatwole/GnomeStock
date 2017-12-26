var user;
var userKey;
var loggedInUser;
var userOnPage;
var userOnPageName;
var name;
var weekIndex;
var monthIndex;
var monthNames;
var monthly;
var total;
var wait = false;
var prices = {};
var historyData = {"Tom":{}, "Alex":{}, "Jack":{}, "Mac":{}};
var comparePageLoaded = false;

firebase.auth().onAuthStateChanged(function(u) {
    if (u) {
        user = u;
        var str = window.location.href.substring(window.location.href.length - 5);
        userOnPageName = (str.charAt(0) === '/') ? str.substring(1,4) : str.substring(0,4);
        getHistory();
    } else {
        window.location = "https://gnomestocks.com/auth/";  
    }
});

var getHistory = function() {
    firebase.database().ref("user/").once("value").then(function(users) {
        var count = 0;
        for (var u in users.val()) (function(u) {
            firebase.database().ref("user/" + u).once("value").then(function(usr) {
                if (usr.val().name === user.displayName) loggedInUser = usr.val();
                if (usr.val().name.toLowerCase() === userOnPageName) userOnPage = usr.val();
                firebase.database().ref("user/" + u + "/history/").once("value").then(function(his) {
                count++;
                    for (var h in his.val()) (function(h) {
                        firebase.database().ref("user/" + u + "/history/" + h).once("value").then(function(i) {
                            historyData[usr.val().name][i.val().month] = i.val();
                        });
                    })(h);
                    if (count === 4) getDataAndValidate();
                });
            });
        })(u);
    });
}

var getDataAndValidate = function() {
    firebase.database().ref("master").once("value").then(function(master) {
        weekIndex = parseInt(master.val().week);
        monthIndex = parseInt(master.val().month);
        monthly = master.val().monthly;
        if (master.val().weekly)
            document.getElementById("weekly").style = "display: lol";
        if (master.val().monthly)
            document.getElementById("monthly").style = "display: lol";
        if (master.val().market)
            document.getElementById("market").style = "display: lol";
            displayLoadedPage();
            var count = 0;
            monthNames = {};
            for (var m in master.val().monthNames) count++;
            for (var m in master.val().monthNames) (function(m) {
                firebase.database().ref("master/monthNames/" + m).once("value").then(function(month) {
                    count--;    
                    monthNames[month.val().month] = month.val().name;
                    if (count == 0)  {
                        displayLoadedPage();
                        if (userOnPage !== undefined)
                            populate();
                    }
                });
            })(m);
    });
}

var populate = function() {
    if (monthly) monthIndex--;
    var lols = document.getElementsByTagName("lol");
    lols[0].innerHTML = userOnPage.ticker;
    lols[2].innerHTML = "$" + dollarString(userOnPage.price);
    populateChangeString(historyData[userOnPage.name][monthIndex - 1].price, userOnPage.price, lols[3], lols[1]);
    var c1data = [];
    var c2data = [];
    lols[4].innerHTML = userOnPage.name + "'s Portfolio Value";
    lols[6].innerHTML = "$" + dollarString(userOnPage.total);
    populateChangeString(historyData[userOnPage.name][monthIndex - 1].total, userOnPage.total, lols[7], lols[5]);
    for (var i = 0; i <= monthIndex; i++) { //TODO: Make this start at 1 
        c1data.push({
            y : historyData[userOnPage.name][i].price / 100,
            label: convertMonthString(monthNames[i]),
            dollarString: dollarString(historyData[userOnPage.name][i].price),
            monthName: monthNames[i],
            color: document.getElementsByTagName("lol")[1].style.color,
        });
        c2data.push({
            y : historyData[userOnPage.name][i].total / 100,
            label: convertMonthString(monthNames[i]),
            dollarString: dollarString(historyData[userOnPage.name][i].total),
            monthName: monthNames[i],
            color: document.getElementsByTagName("lol")[5].style.color
        });
    }
    var count = 0;
    var chart1 = new CanvasJS.Chart("chartContainer1", {
        animationEnabled: true,
        theme: "light2",
        toolTip: {
            content: "{monthName}: ${dollarString}"  
        },
        axisY: {
            includeZero: false,
            labelFormatter: function(e) {
                return "$" + dollarString(Math.round(100 * e.value));
            }
        },
        axisX: {
            title: "Month"
        },
        data: [{
            type : "line",
            dataPoints: c1data
        }]
    });
    var chart2 = new CanvasJS.Chart("chartContainer2", {
        animationEnabled: true,
        theme: "light2",
        toolTip: {
            content: "{monthName}: ${dollarString}"  
        },
        axisY: {
            includeZero: false,
            labelFormatter: function(e) {
                return "$" + dollarString(Math.round(100 * e.value));
            }
        },
        axisX: {
            title: "Month"
        },
        data: [{
            type : "line",
            dataPoints: c2data
        }]
    });
    chart1.render();
    chart2.render();
    lols[8].innerHTML = userOnPage.name + "'s Trading History";
    var m = userOnPage.shares.Mac;
    var t = userOnPage.shares.Tom;
    var a = userOnPage.shares.Alex;
    var j = userOnPage.shares.Jack;
    for (var i = monthIndex; i >= 0; i--) {
        var changes = historyData[userOnPage.name][i].changes;
        var row = document.createElement("tr");
        row.style.height = "97px";
        var d1 = document.createElement("td");
        var d2 = document.createElement("td");
        var d3 = document.createElement("td");
        var d4 = document.createElement("td");
        d1.innerHTML = monthNames[i + 1];
        if (i === 0) {
            d2.innerHTML = "Did not trade";
            d3.innerHTML = "$MAC: " + m + "<br>"
                         + "$TOM: " + t + "<br>"
                         + "$ALEX: " + a + "<br>"
                         + "$JACK: " + j + "<br>"
        }
        else if (i === monthIndex && userOnPage.name !== loggedInUser.name) {
            d2.innerHTML = "Hidden until end of month";
            d3.innerHTML = "Hidden until end of month";
            d2.style = "font-style: italic";
            d3.style = "font-style: italic";
        } else {
            var changeString = "";
            if (changes["Mac"] !== 0) changeString += (changes["Mac"] < 0) ? "Sold " + -changes["Mac"] + " shares of $MAC<br>" : "Bought " + changes["Mac"] + " shares of $MAC<br>";
            if (changes["Tom"] !== 0) changeString += (changes["Tom"] < 0) ? "Sold " + -changes["Tom"] + " shares of $TOM<br>" : "Bought " + changes["Tom"] + " shares of $TOM<br>";
            if (changes["Alex"] !== 0) changeString += (changes["Alex"] < 0) ? "Sold " + -changes["Alex"] + " shares of $ALEX<br>" : "Bought " + changes["Alex"] + " shares of $ALEX<br>";
            if (changes["Jack"] !== 0) changeString += (changes["Jack"] < 0) ? "Sold " + -changes["Jack"] + " shares of $JACK<br" : "Bought " + changes["Jack"] + " shares of $JACK<br>";
            if (changeString === "") changeString = "Did not trade";
            else changeString = changeString.substring(0, changeString.length - 4);
            d2.innerHTML = changeString;
            d3.innerHTML = "$MAC: " + m + "<br>"
                         + "$TOM: " + t + "<br>"
                         + "$ALEX: " + a + "<br>"
                         + "$JACK: " + j + "<br>"
        }
        if (i !== 0) {
            m -= changes["Mac"];
            t -= changes["Tom"];
            j -= changes["Jack"];
            a -= changes["Alex"];
        }
        var arrow = document.createElement("rofl");
        var amount = document.createTextNode(" $" + dollarString(historyData[userOnPage.name][i].total) + " ");
        var change = document.createElement("rofl");
        var previous = (i === 0) ? 10000 : historyData[userOnPage.name][i].total;
        if (i === monthIndex) d4.innerHTML = "TBD";
        else {
            populateChangeString(previous, historyData[userOnPage.name][i + 1].total, change, arrow);
            d4.appendChild(arrow);
            d4.appendChild(amount);
            d4.appendChild(change);
        }
        row.appendChild(d1);
        row.appendChild(d2);
        row.appendChild(d3);
        row.appendChild(d4);
        document.getElementsByTagName("table")[0].appendChild(row);
    }
}

var compare = function() {
    document.getElementById("compare").style = "display: lol";
    document.getElementById("links").style = "display: none";
    if (!comparePageLoaded) {
        comparePageLoaded = true;
        var names = ['Tom', 'Alex', 'Jack', 'Mac'];
        var c1Data = [];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var data = {
                type : "line",
                name : "$" + name.toUpperCase(),
                showInLegend: true, 
                dataPoints : [] 
            };
            var history = historyData[name];
            var j = 0;
            for (var h in history) {
                data.dataPoints.push({
                    y : history[h].price / 100,
                    label: convertMonthString(monthNames[j]),
                    dollarString: dollarString(history[h].price),
                    monthName: monthNames[j],
                    ticker: "$" + name.toUpperCase()
                });
                j++;
            }
            c1Data.push(data);
        }

        c1Data[3].color = "#C6458D";

        var chart1 = new CanvasJS.Chart("chartContainer1", {
            animationEnabled: true,
            theme: "light2",
            toolTip: {
                shared: true,
                content: "{ticker}: ${dollarString}"  
            },
            axisY: {
                includeZero: false,
                labelFormatter: function(e) {
                    return "$" + dollarString(Math.round(100 * e.value));
                }
            },
            axisX: {
                title: "Month"
            },
            data: c1Data
        });
        chart1.render();
    }
}

var displayLoadedPage = function() {
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

var monthNameLibrary = {
    "January" : 1,
    "February" : 2,
    "March" : 3,
    "April" : 4,
    "May" : 5,
    "June" : 6,
    "July" : 7,
    "August" : 8,
    "September" : 9,
    "October" : 10,
    "November" : 11,
    "December" : 12
}

var convertMonthString = function(monthName) {
    return monthNameLibrary[monthName.split(" ")[0]] + "/" + monthName.split(" ")[1].substring(2);
}

$("#mac").hover(function() {
    document.getElementById("mac1").style = "display: none";
    document.getElementById("mac2").style = "display: lol";
}, function() {
    document.getElementById("mac1").style = "display: lol";
    document.getElementById("mac2").style = "display: none";
});

$("#tom").hover(function() {
    document.getElementById("tom1").style = "display: none";
    document.getElementById("tom2").style = "display: lol";
}, function() {
    document.getElementById("tom1").style = "display: lol";
    document.getElementById("tom2").style = "display: none";
});

$("#alex").hover(function() {
    document.getElementById("alex1").style = "display: none";
    document.getElementById("alex2").style = "display: lol";
}, function() {
    document.getElementById("alex1").style = "display: lol";
    document.getElementById("alex2").style = "display: none";
});

$("#jack").hover(function() {
    document.getElementById("jack1").style = "display: none";
    document.getElementById("jack2").style = "display: lol";
}, function() {
    document.getElementById("jack1").style = "display: lol";
    document.getElementById("jack2").style = "display: none";
});

