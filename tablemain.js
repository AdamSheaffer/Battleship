//fix up styling
//maybe make a modal for when you first open up the page -- 'prepare for battle'
//check if all the pieces are on the board and then display a begin button
//clicking begin button should change firebase ready to true

//create player id's

var gameRef;
var myPlayerNumber;

function go() {
  var userId = prompt('Username?', 'Guest');
  // Consider adding '/<unique id>' if you have multiple games.
  gameRef = new Firebase(GAME_LOCATION);
  assignPlayerNumberAndPlayGame(userId, gameRef);
};

// The maximum number of players.  If there are already
// NUM_PLAYERS assigned, users won't be able to join the game.
var NUM_PLAYERS = 2;

// The root of your game data.
var GAME_LOCATION = "https://adamsbattleship.firebaseio.com/";

// A location under GAME_LOCATION that will store the list of
// players who have joined the game (up to MAX_PLAYERS).
var PLAYERS_LOCATION = 'player_list';

// A location under GAME_LOCATION that you will use to store data
// for each player (their game state, etc.)
var PLAYER_DATA_LOCATION = 'player_data';


// Called after player assignment completes.
function playGame(myPlayerNumber, userId, justJoinedGame, gameRef) {
  var playerDataRef = gameRef.child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
  alert('You are player number ' + myPlayerNumber +
      '.  Your data will be located at ' + playerDataRef.toString());

  if (justJoinedGame) {
    alert('Doing first-time initialization of data.');
    playerDataRef.set({userId: userId, state: 'game state'});
  }
}

// Use transaction() to assign a player number, then call playGame().
function assignPlayerNumberAndPlayGame(userId, gameRef) {
  var playerListRef = gameRef.child(PLAYERS_LOCATION);
  myPlayerNumber, alreadyInGame = false;

  playerListRef.transaction(function(playerList) {
    // Attempt to (re)join the given game. Notes:
    //
    // 1. Upon very first call, playerList will likely appear null (even if the
    // list isn't empty), since Firebase runs the update function optimistically
    // before it receives any data.
    // 2. The list is assumed not to have any gaps (once a player joins, they
    // don't leave).
    // 3. Our update function sets some external variables but doesn't act on
    // them until the completion callback, since the update function may be
    // called multiple times with different data.
    if (playerList === null) {
      playerList = [];
    }

    for (var i = 0; i < playerList.length; i++) {
      if (playerList[i] === userId) {
        // Already seated so abort transaction to not unnecessarily update playerList.
        alreadyInGame = true;
        myPlayerNumber = i; // Tell completion callback which seat we have.
        return;
      }
    }

    if (i < NUM_PLAYERS) {
      // Empty seat is available so grab it and attempt to commit modified playerList.
      playerList[i] = userId;  // Reserve our seat.
      myPlayerNumber = i; // Tell completion callback which seat we reserved.
      return playerList;
    }

    // Abort transaction and tell completion callback we failed to join.
    myPlayerNumber = null;
  }, function (error, committed) {
    // Transaction has completed.  Check if it succeeded or we were already in
    // the game and so it was aborted.
    if (committed || alreadyInGame) {
      playGame(myPlayerNumber, userId, !alreadyInGame, gameRef);
    } else {
      alert('Game is full.  Can\'t join. :-(');
    }
  });
}

//Ship Coordinates
var carrier = [];
var battleship = [];
var sub = [];
var destroyer = [];
var patrol = [];
var unabated = true;

$(document).ready(function() {

  go(); //initialize firebase

  $( ".piece" ).draggable({ opacity: 0.6, revert: 'invalid', Index: 100, appenTo: 'td' });
  $('.sea-1 td').droppable();

  // Mother function for setting the board
  $('.sea-1 td').on('drop', function(){
    var x = $(this).data("x");
    var y = $(this).data("y");
    console.log(x +'' + y);
    var coordinates = [x, y];
    var length = shipLength(selectedPiece);
    var fitsOnSea = checkIfPieceFits(coordinates, length, orientation);
    checkForOtherShips(coordinates, length, orientation);
    if (fitsOnSea && unabated) {
      renderPieces(coordinates, length, orientation, selectedPiece);
      hideFromFleet(selectedPiece);
      checkIfAllPiecesArePlaced();
    } else {
      alert("Over the line!");
    }
  });

  //Hide ships from fleet after placing on board
  function hideFromFleet(selectedPiece) {
    var piece = '#'+selectedPiece;
    $(piece).hide('highlight', 200);
  }

  function checkForOtherShips(coordinates, length, orientation) {
    // For horizontal orientation
    for (var i = 0; i < length; i++) {
      if (orientation == 'Horizontal'){
        var cellCoordinates = [coordinates[0] + i, coordinates[1]];
        var cellElement = boardCell(cellCoordinates, 1);
      } else { //For vertical orientation
        var cellCoordinates = [coordinates[0], coordinates[1] - i ];
        var cellElement = boardCell(cellCoordinates, 1);
      }
      if (cellElement.hasClass('occupied')) {
        unabated = false;
        break;
      } else {
        unabated = true;
      }
    }
  }

  function checkIfPieceFits(coordinates, length, orientation) {
    var gridLength = $('.sea-1 tr').length;
    if(orientation == 'Horizontal') {
      if (coordinates[0] + length > gridLength + 1) {
        return false;
      } else {
        return true;
      }
    } else {
      if (coordinates[1] - length < 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  // SELECT PIECE
  var selectedPiece;

  function selectPiece(pieceName) {
    selectedPiece = pieceName;
    console.log(selectedPiece);
  }

  function shipLength(pieceName) {
    switch (pieceName) {
      case 'carrier':
        return 5;
        break;
      case 'battleship':
        return 4;
        break;
      case 'patrol':
        return 2;
        break;
      case 'sub':
        return 3;
        break;
      case 'destroyer':
        return 3;
    }
  }

  $("div.piece").mousedown(function() {
    var pieceName = $(this).data("name");
    selectPiece(pieceName);
  });

  function renderPieces(coordinates, length, orientation, selectedPiece) {
    // For horizontal orientation
    for (var i = 0; i < length; i++) {
      if (orientation == 'Horizontal'){
        var cellCoordinates = [coordinates[0] + i, coordinates[1]];
        var cellElement = boardCell(cellCoordinates, 1);
      } else { //For vertical orientation
        var cellCoordinates = [coordinates[0], coordinates[1] - i ];
        var cellElement = boardCell(cellCoordinates, 1);
      }
      if (i === length-1){
        cellElement.css("background-image", "url('tableimages/" + orientation + (5) +".gif')");
        cellElement.addClass('occupied');
      } else {
        cellElement.css("background-image", "url('tableimages/" + orientation + (i+1) +".gif')");
        cellElement.addClass('occupied');
      }
      logCoordinates(cellCoordinates, selectedPiece);
    }
    fleetSet();
  }

  function logCoordinates(coordinates, selectedPiece) {
    switch(selectedPiece) {
      case 'carrier':
        carrier.push(coordinates);
        break;
      case 'battleship':
        battleship.push(coordinates);
        break;
      case 'sub':
        sub.push(coordinates);
        break;
      case 'destroyer':
        destroyer.push(coordinates);
        break;
      case 'patrol':
        patrol.push(coordinates);
    }
  }

  function fleetSet() { //to log to database
    gameRef.child("player_data/" + myPlayerNumber + "/fleet/carrier").set(carrier);
    gameRef.child("player_data/" + myPlayerNumber + "/fleet/battleship").set(battleship);
    gameRef.child("player_data/" + myPlayerNumber + "/fleet/sub").set(sub);
    gameRef.child("player_data/" + myPlayerNumber + "/fleet/destroyer").set(destroyer);
    gameRef.child("player_data/" + myPlayerNumber + "/fleet/patrol").set(patrol);
  }

  function boardCell(coordinates, gridNumber) {
    var x = coordinates[0];
    var y = coordinates[1];
    var cell = $(".sea-" + gridNumber + " td[data-x='" + x + "'][data-y='" + y + "']");
    return cell;
  }

  function checkIfAllPiecesArePlaced() {
    var occupiedSquares = $('.sea-1 .occupied').length;
    if( occupiedSquares === 17) {
      allPiecesAreOnBoard = true;
      gameInit();
    }
  }

  // TOGGLE ORIENTATION
  var orientation = "Horizontal";

  function toggleOrientation() {
    if (orientation == "Horizontal") {
      orientation = "Vertical";
    } else {
      orientation = "Horizontal";
    }
  }

  $("div#toggle").click(function() { //flip ship orientation
    toggleOrientation();
    $("div.piece").each(function() {
      var width = $(this).width();
      var height = $(this).height();
      var background = $(this).attr('id') + orientation;
      $(this).css("background-image", "url('tableimages/" + background +".gif')");
      $(this).css("background-size", height + 'px ' + width + 'px');
      $(this).width(height);
      $(this).height(width);
    })
  });

  //Attacking
  var hit = false;

  $('.sea-2 td').click(function(){
    var x = $(this).data("x");
    var y = $(this).data("y");
    var attackCoordinates = [x, y];
    var opponent = opponentNumber(myPlayerNumber);
    gameRef.child("player_data/" + opponent + "/fleet").on("value", function(snapshot) {
      var opponentCarrier = snapshot.val().carrier;
      var opponentBattleship = snapshot.val().battleship;
      var opponentDestroyer = snapshot.val().destroyer;
      var opponentSub = snapshot.val().sub;
      var opponentPatrol = snapshot.val().patrol;
      var totalOccupiedCells = opponentCarrier.concat(opponentBattleship, opponentDestroyer, opponentSub, opponentPatrol);
      checkForHit(attackCoordinates, totalOccupiedCells); //check for hit or miss
      renderAttack(attackCoordinates); //render attack with css
    });
  });

  function checkForHit(attackCoordinates, totalOccupiedCells) {
    for (var i=0; i<totalOccupiedCells.length; i++) {
      console.log(attackCoordinates.toString() + 'and' + totalOccupiedCells[i].toString() );
      if (attackCoordinates.toString() === totalOccupiedCells[i].toString()) {
        hit = true;
        break;
      } else {
        hit = false;
      }
    }
  }

  function renderAttack(coordinates) {
    var cellCoordinates = [coordinates[0], coordinates[1]];
    var cellElement = boardCell(cellCoordinates, 2);
    if (hit === true) {
      cellElement.css("background-image", "url('tableimages/hit.gif')");
    } else {
      cellElement.css("background-image", "url('tableimages/miss.gif')");
    }
  }

  function opponentNumber(myPlayerNumber) {
    if (myPlayerNumber === 1) {
      return 0
    } else {
      return 1;
    }
  }

  var allPiecesAreOnBoard = false;

  function gameInit() {
    gameRef.child("player_data/" + myPlayerNumber + "/state").set('ready');
    var opponent = opponentNumber(myPlayerNumber);
    gameRef.child("player_data/" + opponent + "/state").on("value", function(snapshot) {
      var opponentReady = snapshot.val();
      if (opponentReady !== "ready") {
        $('#lightbox').show('drop');
        $('#begin-modal').show('drop');
      }
    });
  }
  
});
