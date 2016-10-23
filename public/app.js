var config = {
    apiKey: "AIzaSyCgbxY5YSjwmQHo-LcYeSPCC5_7mB2fmv8",
    authDomain: "speedy-ca2db.firebaseapp.com",
    databaseURL: "https://speedy-ca2db.firebaseio.com",
    storageBucket: "speedy-ca2db.appspot.com",
    messagingSenderId: "616769855233"
  };
var colors = ["rgb(244, 67, 54)", "rgb(139, 195, 74)", "rgb(33, 150, 243)", "rgb(255, 193, 7)"];
var images = ["images/red.png",
             "images/green.png",
             "images/blue.png",
             "images/yellow.png"];
var database;
var players = [];
var minLat, maxLat, minLong, maxLong;
var markers = [];
var mapPaths = [];
var globalMap;
var localMaps = [];
var temp_info = [];
var selectedGame;

function Player(name) {
    this.name = name;
}
Player.prototype.setMarker = function(marker) {
    this.marker = marker;
};
Player.prototype.setColor = function(color) {
    this.color = color;
};
Player.prototype.setGame = function(game) {
    this.game = game;
};
Player.prototype.setPath = function(p) {
    this.path = p;
};
Player.prototype.setProgress = function(progress) {
    this.progress = progress;
};
Player.prototype.setGoal = function(goal) {
    this.goal = goal;
};

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
    }
    else {
        e.target.getElementsByClassName("game-button")[0].innerHTML = "+"; e.target.parentElement.style.backgroundColor="transparent";
        e.target.parentElement.style.maxHeight="30px";
        e.target.parentElement.style.color="rgb(65,64,66)";
        selectedGame = -1;
    }
    load_game(selectedGame);
}

function expand_games_by_index(index) {
    Array.prototype.forEach.call(document.getElementsByClassName("game")[index].getElementsByClassName("game-member"), function(member) {
        if(document.getElementsByClassName("game")[index].getElementsByClassName("game-button")[0].innerHTML == "+") {
            member.style.display="block";
        }
    }); Array.prototype.forEach.call(document.getElementsByClassName("game")[index].getElementsByClassName("progress-bar"), function(member) {
        if(document.getElementsByClassName("game")[index].getElementsByClassName("game-button")[0].innerHTML == "+") {
            member.style.display="block";
        }
    });
    if(document.getElementsByClassName("game")[index].getElementsByClassName("game-button")[0].innerHTML == "+") {
        document.getElementsByClassName("game")[index].getElementsByClassName("game-button")[0].innerHTML = "-";
        document.getElementsByClassName("game")[index].style.backgroundColor="rgb(65,64,66)";
        document.getElementsByClassName("game")[index].style.maxHeight="250px";
        document.getElementsByClassName("game")[index].style.color="rgb(230,230,210)";
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
        selectedGame = index;
    }
    load_game(selectedGame);
}

function initMap() {
    var mapStyle= [
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
    ];
    globalMap = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 1,
        panControl: false,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        styles: mapStyle
    });
    for(i=0; i<4; i++) {
        localMaps[i] = new google.maps.Map(document.getElementById('localMap'+i), {
            center: {lat: 0, lng: 0},
            zoom: 1,
            panControl: false,
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
            styles: mapStyle
        });
    }
}

function calculate_distance(path) {
    var n = path.length;
    var dist = 0;
    for(var i=1; i<n; i++) {
        var tx = (path[i].lat-path[i-1].lat)*2*6378*Math.PI/360;
        var ty = (path[i].lng-path[i-1].lng)*2*6378*Math.PI/360;
        dist += Math.sqrt(tx*tx+ty*ty);
    }
    return dist;
}

function load_game(index) {
    var gm = document.getElementById("map");
    var lm = new Array(4);
    var bounds = new google.maps.LatLngBounds();
    lm[0] = document.getElementById("localMap0");
    lm[1] = document.getElementById("localMap1");
    lm[2] = document.getElementById("localMap2");
    lm[3] = document.getElementById("localMap3");
    lm[0].style.display="none";
    lm[1].style.display="none";
    lm[2].style.display="none";
    lm[3].style.display="none";
    if(index == -1) {
        gm.style.display="block";
        google.maps.event.trigger(globalMap,'resize');
        for(var pl in players) {
            if(players.hasOwnProperty(pl)) {
                players[pl].marker.setMap(globalMap);
                google.maps.event.clearInstanceListeners(players[pl].marker);
                google.maps.event.addListener(players[pl].marker, 'click', function(e) {
                    for(var playr in players) {
                        if(players.hasOwnProperty(playr)) {
                            if(players[playr].marker === this) {
                                expand_games_by_index(players[playr].game);
                            }
                        }
                    }
                });
                google.maps.event.addListener(players[pl].marker, 'mouseover', function(e) {
                    for(var playr in players) {
                        if(players.hasOwnProperty(playr)) {
                            if(players[playr].marker === this) {
                                for(var p in players) {
                                    if(players.hasOwnProperty(p)) {
                                        if(players[playr].game == players[p].game) {
                                            var newInfo = new google.maps.InfoWindow({
                                              content: players[p].name
                                            });
                                            newInfo.open(globalMap, players[p].marker);
                                            temp_info.push(newInfo);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                google.maps.event.addListener(players[pl].marker, 'mouseout', function(e) {
                    temp_info.forEach(function (inf) {
                        inf.close();
                    });
                    temp_info = [];
                });
            }
        }
        for(var pl in players) {
            if(players.hasOwnProperty(pl)) {
                players[pl].path.forEach(function(p) {
                    bounds.extend(p.lat, p.lng);
                });
            }
        }
        globalMap.fitBounds(bounds);
        google.maps.event.trigger(globalMap, 'resize');
    }
    else {
        /*firebase.database().ref('/').once('value').then(function(snapshot)
        {
            var res = snapshot.val();*/
            gm.style.display="none";
            var mapPlayers = [];
            var numPlayers = 0;
            for(var pl in players) {
                if(players.hasOwnProperty(pl)) {
                    if(players[pl].game == index) {
                        lm[numPlayers].style.display = "inline-block";
                        numPlayers ++;
                    }
                }
            }
            if(numPlayers == 2) {
                lm[0].style.width = "66.67vw";
                lm[1].style.top="50%";
                lm[1].style.left = "33.33vw";
                lm[1].style.width = "66.67vw";
            } else if(numPlayers == 3) {
                lm[0].style.width = "33.33vw";
                lm[1].style.left = "66.67vw";
                lm[1].style.top = "0";
                lm[1].style.width = "33.33vw";
                lm[2].style.top = "50%";
                lm[2].style.width = "66.67vw";
            } else {
                lm[0].style.width = "33.33vw";
                lm[1].style.top = "0";
                lm[1].style.left = "66.67vw";
                lm[1].style.width = "33.33vw";
                lm[2].style.top = "50%";
                lm[2].style.width = "33.33vw";
                lm[3].style.top = "50%";
                lm[3].style.left = "66.67vw";
                lm[3].style.width = "33.33vw";
            }
            numPlayers = 0;
            for(var pl in players) {
                if(players.hasOwnProperty(pl)) {
                    if(players[pl].game == index) {
                        mapPlayers.push({pl: players[pl]});
                        var path = [];
                        var minLat = undefined,
                            minLong = undefined,
                            maxLat = undefined,
                            maxLong = undefined;
                        console.log(players[pl].path);
                        players[pl].path.forEach(function (p) {
                            if(minLat == undefined) {
                                minLat = p.lat;
                                minLong = p.lng;
                                maxLat = p.lat;
                                maxLong = p.lng;
                            }
                            else {
                                if(minLat > p.lat)
                                    minLat = p.lat;
                                if(maxLat < p.lat)
                                    maxLat = p.lat;
                                if(minLong > p.lng)
                                    minLong = p.lng;
                                if(maxLong < p.lng)
                                    maxLong = p.lng;
                            }
                            
                        });
                        /*for(var game in res.games) {
                            if(res.games.hasOwnProperty(game)) {
                                for(var pos in res.games[game].positions) {
                                    if(res.games[game].positions.hasOwnProperty(pos)) {
                                        var p = res.games[game].positions[pos];
                                        if(p.player_id == pl) {
                                            for(var coords in p.position_history) {
                                                if(p.position_history.hasOwnProperty(coords)) {
                                                    path.push({lat: p.position_history[coords].latitude, lng: p.position_history[coords].longitude});
                                                    if(minLat == undefined) {
                                                        minLat = p.position_history[coords].latitude;
                                                        maxLat = p.position_history[coords].latitude;
                                                        minLong = p.position_history[coords].longitude;
                                                        maxLong = p.position_history[coords].longitude;
                                                        continue;
                                                    }
                                                    if(minLat > p.position_history[coords].latitude)
                                                        minLat = p.position_history[coords].latitude;
                                                    if(maxLat < p.position_history[coords].latitude)
                                                        maxLat = p.position_history[coords].latitude;
                                                    if(minLong > p.position_history[coords].longitude)
                                                        minLong = p.position_history[coords].longitude;
                                                    if(maxLong < p.position_history[coords].longitude)
                                                        maxLong = p.position_history[coords].longitude;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }*/
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(new google.maps.LatLng(minLat, minLong));
                        bounds.extend(new google.maps.LatLng(maxLat, maxLong));
                        localMaps[numPlayers].fitBounds(bounds);
                        google.maps.event.trigger(localMaps[numPlayers], 'resize');
                        localMaps[numPlayers].setCenter(new google.maps.LatLng((minLat+maxLat)/2, (minLong+maxLong)/2));
                        new google.maps.Polyline({
                            path: players[pl].path,
                            geodesic: true,
                            strokeColor: colors[players[pl].color],
                            strokeOpacity: 1.0,
                            strokeWeight: 5
                        }).setMap(localMaps[numPlayers]);
                        var mark = players[pl].marker;
                        mark.setPosition(new google.maps.LatLng(players[pl].path[players[pl].path.length-1].lat, players[pl].path[players[pl].path.length-1].lng));
                        mark.setMap(localMaps[numPlayers]);
                        players[pl].setProgress(calculate_distance(players[pl].path)/players[pl].goal);
                        var prgs = document.getElementsByClassName("game")[selectedGame].getElementsByClassName("progress-bar");
                        Array.prototype.forEach.call(prgs, function(prg) {
                            if(prg.getElementsByClassName("progress")[0].style.background == colors[players[pl].color]) {
                                prg.getElementsByClassName("progress")[0].style.width=players[pl].progress*100+"%";
                            }
                        });
                        
                        numPlayers ++;
                    }
                }
            }
        //});
        google.maps.event.trigger(globalMap,'resize');
        google.maps.event.trigger(localMaps[0],'resize');
        google.maps.event.trigger(localMaps[1],'resize');
        google.maps.event.trigger(localMaps[2],'resize');
        google.maps.event.trigger(localMaps[3],'resize');
    }
}

function fill_games() {
    firebase.database().ref('/').on('value', function(snapshot)
    {
        var res = snapshot.val();
        for (var key in res.players) {
            if (res.players.hasOwnProperty(key)) {
                if(players[key]==undefined) {
                    players[key]=new Player(res.players[key].name);
                }
            }
        }
        console.log(players);
        var gameCount = 0;
        for(var game in res.lobby) {
            if(res.lobby.hasOwnProperty(game)) {
                if(document.getElementById(game) == undefined) {
                    var newGame = document.createElement("div");
                    newGame.className = "game";
                    newGame.id = game;
                    
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
                    players[res.lobby[game].host_id].setColor(0);
                    players[res.lobby[game].host_id].setGame(gameCount);
                    players[res.lobby[game].host_id].setGoal(res.lobby[game].room_distance);
                    newGame.appendChild(newMember);
                    var progressbar = document.createElement("div");
                    progressbar.className="progress-bar";
                    var progress = document.createElement("div");
                    progress.className="progress";
                    progress.style.background=colors[0];
                    progressbar.appendChild(progress);
                    newGame.appendChild(progressbar);
                }
                else {
                    var newGame = document.getElementById(game);
                }

                var child = 1;
                for(var player in res.lobby[game].players) {
                    if(res.lobby[game].players.hasOwnProperty(player)) {
                        if(document.getElementById(player) == undefined) {
                            var newMember = document.createElement("span");
                            newMember.className = "game-member";
                            newMember.id = player;
                            newMember.innerHTML = players[player].name;
                            newMember.style.color=colors[child];
                            players[player].setColor(child);
                            players[player].setGame(gameCount);
                            players[player].setGoal(res.lobby[game].room_distance);
                            newGame.appendChild(newMember);
                            var progressbar = document.createElement("div");
                            progressbar.className="progress-bar";
                            var progress = document.createElement("div");
                            progress.className="progress";
                            progress.style.background=colors[child];
                            progressbar.appendChild(progress);
                            newGame.appendChild(progressbar);
                        }
                        child++;
                    }
                }
                gameCount ++;
                
                if(document.getElementById(game) == undefined) {
                    document.getElementById("left-view").appendChild(newGame);
                }
            }
        }
        console.log(players);
        
        var bounds = new google.maps.LatLngBounds();
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
                                bounds.extend(new google.maps.LatLng(ent.latitude, ent.longitude));
                            }
                        }
                        console.log(pos);
                        console.log(players[pos]);
                        players[pos].setPath(path);
                        new google.maps.Polyline({
                            path: path,
                            geodesic: true,
                            strokeColor: colors[players[pos].color],
                            strokeOpacity: 1.0,
                            strokeWeight: 5
                        }).setMap(globalMap);
                        var mark = new google.maps.Marker({
                            position: new google.maps.LatLng(path[path.length-1].lat, path[path.length-1].lng),
                            draggable: false,
                            map: globalMap,
                            icon: images[players[pos].color]
                        });
                        players[pos].setMarker(mark);
                        google.maps.event.addListener(players[pos].marker, 'click', function(e) {
                            for(var pl in players) {
                                if(players.hasOwnProperty(pl)) {
                                    if(players[pl].marker === this) {
                                        expand_games_by_index(players[pl].game);
                                    }
                                }
                            }
                        });
                        google.maps.event.addListener(players[pos].marker, 'mouseover', function(e) {
                            for(var pl in players) {
                                if(players.hasOwnProperty(pl)) {
                                    if(players[pl].marker === this) {
                                        for(var p in players) {
                                            if(players.hasOwnProperty(p)) {
                                                if(players[pl].game == players[p].game) {
                                                    var newInfo = new google.maps.InfoWindow({
                                                      content: players[p].name
                                                    });
                                                    newInfo.open(globalMap, players[p].marker);
                                                    temp_info.push(newInfo);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }); google.maps.event.addListener(players[pos].marker, 'mouseout', function(e) {
                            temp_info.forEach(function (inf) {
                                inf.close();
                            });
                            temp_info = [];
                        });
                       
                    }
                }
            }
        }
        console.log("bounds: "+minLat+","+minLong+" "+maxLat+","+maxLong);
        globalMap.fitBounds(bounds);
        google.maps.event.trigger(globalMap, 'resize');
        if(selectedGame != -1)
            load_game(selectedGame);
    });
}

/* Testing function - returns 3 coordinates representing a path in the Atlanta Metro Area, with reasonable spacing between points */
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