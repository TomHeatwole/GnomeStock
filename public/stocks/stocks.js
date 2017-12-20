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
                if (usr.val().name.toLowerCase() === user.displayName) loggedInUser = usr.val();
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
                    if (count == 0) 
                        if (userOnPage === undefined)
                            displayLoadedPage();
                        else
                            populate();
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
    displayLoadedPage();
    var c1data = [];
    console.log(convertMonthString("December 2018"));
    var chart1 = new CanvasJS.Chart("chartContainer1", {
        animationEnabled: true,
        theme: "light2",
        axisY: {
            includeZero: false,
            title: "$"
        },
        axisX: {
            title: "Month"
        },
        data: [{        
            type: "line",       
            dataPoints: [
                { y: 450, label: "11/17" },
                { y: 414},
                { y: 520, indexLabel: "highest",markerColor: "red", markerType: "triangle" },
                { y: 460 },
                { y: 450 },
                { y: 500 },
                { y: 480 },
                { y: 480 },
                { y: 410 , indexLabel: "lowest",markerColor: "DarkSlateGrey", markerType: "cross" },
                { y: 500 },
                { y: 480 },
                { y: 510 }
            ]
        }]
    });
    lols[4].innerHTML = userOnPage.name + "'s Portfolio Value";
    lols[6].innerHTML = "$" + dollarString(userOnPage.total);
    populateChangeString(historyData[userOnPage.name][monthIndex - 1].total, userOnPage.total, lols[7], lols[5]);
    chart1.render();
    var chart2 = new CanvasJS.Chart("chartContainer2", {
        animationEnabled: true,
        theme: "light2",
        axisY:{
            includeZero: false
        },
 //       yValueFormatString: "##0.00\"%\"",
 //       indexLabel: "{label} {y}",
        data: [{        
            type: "line",       
            dataPoints: [
                { y: 450 },
                { y: 414},
                { y: 520, indexLabel: "highest",markerColor: "red", markerType: "triangle" },
                { y: 460 },
                { y: 450 },
                { y: 500 },
                { y: 480 },
                { y: 480 },
                { y: 410 , indexLabel: "lowest",markerColor: "DarkSlateGrey", markerType: "cross" },
                { y: 500 },
                { y: 480 },
                { y: 510 }
            ]
        }]
    });
    chart2.render();

    lols[8].innerHTML = userOnPage.name + "'s Trading History";
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

