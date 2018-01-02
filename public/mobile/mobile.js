var masterData;
var weekIndex;
var monthIndex;

$(document).ready(function() {
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
        if (masterData.monthly === false && masterData.weekly === false)
            window.location = "https://gnomestocks.com/";
    });
});
