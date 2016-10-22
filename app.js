var config = {
    apiKey: "AIzaSyCgbxY5YSjwmQHo-LcYeSPCC5_7mB2fmv8",
    authDomain: "speedy-ca2db.firebaseapp.com",
    databaseURL: "https://speedy-ca2db.firebaseio.com",
    storageBucket: "speedy-ca2db.appspot.com",
    messagingSenderId: "616769855233"
  };
var database;
var players = [];
var map;

(function() {
    window.addEventListener("load", function(e) {
        init_firebase();
    });
})();

function init_firebase() {
    firebase.initializeApp(config);
    database = firebase.database();
    
    fill_games();
    init_events();
}
    
function init_events() {
    Array.prototype.forEach.call(document.getElementsByClassName("game"), function(game) {
        game.addEventListener("click", function(e) {
            expand_games(e);
        });
    });
}

function expand_games(e) {
    Array.prototype.forEach.call(e.target.getElementsByClassName("game-member"), function(member) {
        if(e.target.getElementsByClassName("game-button")[0].innerHTML == "-") {
            member.style.display="none";
        }
        else {
            member.style.display="block";
        }
    });
    if(e.target.getElementsByClassName("game-button")[0].innerHTML == "+")
        e.target.getElementsByClassName("game-button")[0].innerHTML = "-";
    else
        e.target.getElementsByClassName("game-button")[0].innerHTML = "+";
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
}

function fill_games() {
    firebase.database().ref('/').once('value').then(function(snapshot)
    {
        var res = snapshot.val();
        res.players.forEach(function(player) {
            players[player.id]=player.name;
        });
        console.log(players);
        res.lobby.forEach(function(game) {
            var newGame = document.createElement("div");
            newGame.className = "game";
            
            var gameCode = "";
            gameCode += "<span class=\"game-button\">+</span>\n";
            gameCode += "<span class=\"game-host\">" + players[game.host_id] + "</span>\n";
            game.players.forEach(function(player) {
                gameCode += "<span class=\"game-member\">" + players[player.player_id] + "</span>\n";
            });
            
            newGame.innerHTML = gameCode;
            newGame.addEventListener("click", function(e) {
                expand_games(e);
            });
            document.getElementById("left-view").appendChild(newGame);
        });
        console.log(snapshot.val().lobby[0].host_id);
    });
}

function randomCoords(n) {
    var lat = Math.random()*(33.920360-33.620509)+33.620509;
    var long = Math.random()*(-84.230986+84.504650)-84.230986;
    var coords = "[\n";
    for(i = 0; i < n; i++)
    {
        var dist = Math.random()*50;
        var dir = Math.random()*2*Math.PI;
        var newLat = lat + dist*Math.sin(dir)*360/(2*Math.PI*6378000);
        var newLong = long + dist*Math.cos(dir)*360/(2*Math.PI*6378000);
        coords += "{\"latitude\": " + newLat.toFixed(5) + ", \"longitude\": " + newLong.toFixed(5) + "}";
        if(i != n-1) coords += ",";
        coords += "\n";
        lat = newLat;
        long = newLong;
    }
    coords += "]";
    console.log(coords);
}