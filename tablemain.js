//check if all the pieces are on the board and then display a begin button

var carrier = [];
var battleship = [];
var sub = [];
var destroyer = [];
var patrol = [];
var unabated = true;

var firebase = new Firebase("https://adamsbattleship.firebaseio.com/");

firebase.set({
  playerOneReady: false,
  playerTwoReady: false,
  playersTurn: 1,
  attackedCell: 0,
  hit: false,
  playerOne: {
    carrier: 5,
    battleship: 4,
    sub: 3,
    destroyer: 3,
    patrol: 2,
    totalHealth: 17
  },
  playerTwo: {
    carrier: 5,
    battleship: 4,
    sub: 3,
    destroyer: 3,
    patrol: 2,
    totalHealth: 17
  }
});

$(document).ready(function() {

  // Mother function
  $('.sea-1 td').click(function(){
    var x = $(this).data("x");
    var y = $(this).data("y");
    var coordinates = [x, y];
    var length = shipLength(selectedPiece);
    var fitsOnSea = checkIfPieceFits(coordinates, length, orientation);
    checkForOtherShips(coordinates, length, orientation);
    if (fitsOnSea && unabated) {
      renderPieces(coordinates, length, orientation, selectedPiece);
      hideFromFleet(selectedPiece);
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

  $("div.piece").click(function() {
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
        sub.push(coordinates)
        break;
      case 'destroyer':
        destroyer.push(coordinates);
        break;
      case 'patrol':
        patrol.push(coordinates);
    }
  }

  function boardCell(coordinates, gridNumber) {
    var x = coordinates[0];
    var y = coordinates[1];
    var cell = $(".sea-" + gridNumber + " td[data-x='" + x + "'][data-y='" + y + "']");
    return cell;
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

  $("div#toggle").click(function() {
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



  $('.sea-2 td').click(function(){
    var x = $(this).data("x");
    var y = $(this).data("y");
    var attackCoordinates = [x, y];
    takeFire(attackCoordinates);
  });



  function takeFire(coordinates) {
    var cellCoordinates = [coordinates[0], coordinates[1]];
    // var cellElement = boardCell(cellCoordinates, 2);
    firebase.set({
      playerOneAttack: cellCoordinates
    });
  }





});
