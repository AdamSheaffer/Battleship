//checkIfPeiceFits should check for other ships
//ships in fleet should be hidden when placed on the board


var carrier = [];
var battleship = [];
var sub = [];
var destroyer = [];
var patrol = [];

$(document).ready(function() {

  // Mother function
  $('td').click(function(){
    var x = $(this).data("x");
    var y = $(this).data("y");
    var coordinates = [x, y];
    var length = shipLength(selectedPiece);
    var fitsOnSea = checkIfPieceFits(coordinates, length, orientation);
    if (fitsOnSea) {
      renderPieces(coordinates, length, orientation, selectedPiece);
    } else {
      alert("Over the line!");
    }

    // storeCoordinates();
  });

  function checkIfPieceFits(coordinates, length, orientation) {
    var gridLength = $('.sea tr').length;
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
        var cellElement = boardCell(cellCoordinates);
      } else { //For vertical orientation
        var cellCoordinates = [coordinates[0], coordinates[1] - i ];
        var cellElement = boardCell(cellCoordinates);
      }
      if (i === length -1){
        cellElement.css("background-image", "url('tableimages/" + orientation + (5) +".gif')");
      } else {
        cellElement.css("background-image", "url('tableimages/" + orientation + (i+1) +".gif')");
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

  function boardCell(coordinates) {
    var x = coordinates[0];
    var y = coordinates[1];
    var cell = $("td[data-x='" + x + "'][data-y='" + y + "']");
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

});
