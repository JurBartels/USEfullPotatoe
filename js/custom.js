// Global variables
var lengthSquare = 0;   // Length of side of square dirt
var fields = [];       // List of squares that the farmer has

// Square is a piece of land
var square = {
    'used': false,
    'nitrate': 0
};


var genField = function (x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number");
    }
    for (var i = 0; i < x; i++) {
        fields[i] = [];
        for (var j = 0; j < y; j++) {
            fields[i][j] = square;
        }
    }
    fields[1][1].used = true;
};


function startModel() {
    // TODO: change 2,2 to what the farmer fills in
    genField(2, 2);
}
