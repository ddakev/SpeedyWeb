var config = {
    apiKey: "AIzaSyCgbxY5YSjwmQHo-LcYeSPCC5_7mB2fmv8",
    authDomain: "speedy-ca2db.firebaseapp.com",
    databaseURL: "https://speedy-ca2db.firebaseio.com",
    storageBucket: "speedy-ca2db.appspot.com",
    messagingSenderId: "616769855233"
  };
var colors = ["#F44336", "#8BC34A", "#2196F3", "#FFC107"];
var database;
var players = [];
var minLat, maxLat, minLong, maxLong;
var markers = [];
var mapPaths = [];
var map;
var selectedGame;

function Player(name) {
    this.name = name;
}
Player.prototype.setMarker = function(marker) {
    this.marker = marker;
};
Player.prototype.setColor = function(color) {
    this.color = color;
}

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
   selectedGame = -1;
}

function expand_games(e) {
    Array.prototype.forEach.call(e.target.parentElement.getElementsByClassName("game-member"), function(member) {
        if(e.target.getElementsByClassName("game-button")[0].innerHTML == "-") {
            member.style.display="none";
        }
        else {
            member.style.display="block";
        }
    }); Array.prototype.forEach.call(e.target.parentElement.getElementsByClassName("progress-bar"), function(member) {
        if(e.target.getElementsByClassName("game-button")[0].innerHTML == "-") {
            member.style.display="none";
        }
        else {
            member.style.display="block";
        }
    });
    if(e.target.getElementsByClassName("game-button")[0].innerHTML == "+") {
        e.target.getElementsByClassName("game-button")[0].innerHTML = "-";
        e.target.parentElement.style.backgroundColor="rgb(65,64,66)";
        e.target.parentElement.style.maxHeight="250px";
        e.target.parentElement.style.color="rgb(230,230,210)";
        if(selectedGame != -1) {
            var oldGame = document.getElementsByClassName("game")[selectedGame];
            Array.prototype.forEach.call(oldGame.getElementsByClassName("game-member"), function(member) {
                member.style.display="none";
            }); Array.prototype.forEach.call(oldGame.getElementsByClassName("progress-bar"), function(member) {
                member.style.display="none";
            });
            oldGame.getElementsByClassName("game-button")[0].innerHTML = "+"; oldGame.style.backgroundColor="transparent";
            oldGame.style.color="rgb(65,64,66)";
            oldGame.style.maxHeight="30px";
        }
        for(i = 0; i < document.getElementsByClassName("game").length; i++)
        {
            if(document.getElementsByClassName("game")[i] === e.target.parentElement) {
                selectedGame = i;
                break;
            }
        }
        load_game(selectedGame);
    }
    else {
        e.target.getElementsByClassName("game-button")[0].innerHTML = "+"; e.target.parentElement.style.backgroundColor="transparent";
        e.target.parentElement.style.maxHeight="30px";
        e.target.parentElement.style.color="rgb(65,64,66)";
        selectedGame = -1;
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 1,
        panControl: false,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        styles: [
          {
            "stylers": [
              {
                "saturation": -25
              },
              {
                "visibility": "simplified"
              },
              {
                "weight": 1
              }
            ]
          },
          {
            "elementType": "geometry",
            "stylers": [
              {
                "saturation": -25
              }
            ]
          },
          {
            "featureType": "administrative",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "stylers": [
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "stylers": [
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "weight": 3
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.local",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }
        ]
    });
}

function load_game(index) {
    
}

function fill_games() {
    firebase.database().ref('/').once('value').then(function(snapshot)
    {
        var res = snapshot.val();
        for (var key in res.players) {
            if (res.players.hasOwnProperty(key)) {
                players[res.players[key].id]=new Player(res.players[key].name);
            }
        }
        console.log(players);
        for(var game in res.lobby) {
            if(res.lobby.hasOwnProperty(game)) {
                var newGame = document.createElement("div");
                newGame.className = "game";

                var expander = document.createElement("div");
                expander.className = "game-expander";
                expander.innerHTML += "<span class=\"game-button\">+</span>\n";
                expander.innerHTML += "<span class=\"game-host\">" + players[res.lobby[game].host_id].name + "'s race</span>\n";
                expander.addEventListener("click", function(e) {
                    expand_games(e);
                });
                expander.addEventListener("mouseover", function(e) {
                    if(selectedGame == -1 || document.getElementsByClassName("game")[selectedGame] != e.target.parentElement) {
                        e.target.parentElement.style.backgroundColor="rgb(210,210,210)";
                    }
                });
                expander.addEventListener("mouseout", function(e) {
                    if(selectedGame == -1 || document.getElementsByClassName("game")[selectedGame] != e.target.parentElement) {
                        e.target.parentElement.style.backgroundColor="transparent";
                    }
                });
                newGame.appendChild(expander);

                var newMember = document.createElement("span");
                newMember.className = "game-member";
                newMember.innerHTML = players[res.lobby[game].host_id].name;
                newMember.style.color=colors[0];
                newGame.appendChild(newMember);
                var progressbar = document.createElement("div");
                progressbar.className="progress-bar";
                var progress = document.createElement("div");
                progress.className="progress";
                progress.style.background=colors[0];
                progressbar.appendChild(progress);
                newGame.appendChild(progressbar);
                var child = 1;
                res.lobby[game].players.forEach(function(player) {
                    var newMember = document.createElement("span");
                    newMember.className = "game-member";
                    newMember.innerHTML = players[player.player_id].name;
                    newMember.style.color=colors[child];
                    newGame.appendChild(newMember);
                    var progressbar = document.createElement("div");
                    progressbar.className="progress-bar";
                    var progress = document.createElement("div");
                    progress.className="progress";
                    progress.style.background=colors[child];
                    progressbar.appendChild(progress);
                    newGame.appendChild(progressbar);
                    child++;
                });

                document.getElementById("left-view").appendChild(newGame);
            }
        }
        for(var room in res.games) {
            if(res.games.hasOwnProperty(room)) {
                for(var pos in res.games[room].positions) {
                    if(res.games[room].positions.hasOwnProperty(pos)) {
                        var path = [];
                        for(var entry in res.games[room].positions[pos].position_history) {
                            if(res.games[room].positions[pos].position_history.hasOwnProperty(entry)) {
                                var ent = res.games[room].positions[pos].position_history[entry];
                                if(minLat == undefined) {
                                    minLat = ent.latitude;
                                    maxLat = ent.latitude;
                                    minLong = ent.longitude;
                                    maxLong = ent.longitude;
                                }
                                else {
                                    if(minLat > ent.latitude)
                                        minLat = ent.latitude;
                                    if(maxLat < ent.latitude)
                                        maxLat = ent.latitude;
                                    if(minLong > ent.longitude)
                                        minLong = ent.longitude;
                                    if(maxLong < ent.longitude)
                                        maxLong = ent.longitude;
                                }
                                path.push({lat: ent.latitude, lng: ent.longitude});
                            }
                        }
                        mapPaths.push(new google.maps.Polyline({
                            path: path,
                            geodesic: true,
                            strokeColor: '#2196F3',
                            strokeOpacity: 1.0,
                            strokeWeight: 5
                        }).setMap(map));
                        players[res.games[room].positions[pos].player_id]=new google.maps.Marker({
                            position: new google.maps.LatLng(path[path.length-1].lat, path[path.length-1].lng),
                            map: map
                        });
                    }
                }
            }
        }
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(minLat, minLong));
        bounds.extend(new google.maps.LatLng(maxLat, maxLong));
        map.fitBounds(bounds);
    });
}

function randomCoords(n) {
    var lat = Math.random()*(33.920360-33.620509)+33.620509;
    var long = Math.random()*(-84.230986+84.504650)-84.504650;
    var coords = "[\n";
    for(i = 0; i < n; i++)
    {
        var dist = Math.random()*500;
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