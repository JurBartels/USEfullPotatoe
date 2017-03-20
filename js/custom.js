// Global variables
var lengthSquare = 0;   // Length of side of square dirt
var fields = [];       // List of squares that the farmer has
var isInit = false;     // True if the fields var is initialized
var canvasShape = null;
var canvasValues = null;

// Square is a piece of land
var square = {
    'used': false,
    'nitrate': 0
};

$(document).ready(function () {
    canvasShape = $('#canvasShape');
    canvasValues = $('#canvasValues');
});

var initialize = function (x, y, length) {
    if (typeof x != 'number' || typeof y != 'number' || typeof length != 'number') {
        throw new TypeError("x, y or length isn't a number");
    } else if (x < 1 || y < 1 || length < 1) {
        throw new RangeError('x, y and length cannot be less than 1')
    }
    setLengthSquares(length);
    genField(x, y);
    isInit = true;
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
};

var setLengthSquares = function (length) {
    if (typeof length != 'number') {
        throw new TypeError("length isn't a number");
    } else if (length < 1) {
        throw new RangeError('length cannot be less than 1')
    }
    lengthSquare = length;
};

var setUsed = function (x, y, used) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number");
    } else if (x < 0 || y < 0) {
        throw new RangeError('x or y cannot be less than 0')
    } else if (typeof used != 'boolean') {
        throw new TypeError('used needs to be a boolean')
    } else if (!isInit) {
        throw new Error('not initialized')
    } else if (x > fields.length || y > fields[0].length) {
        throw new RangeError('x or y is bigger than the field')
    }
    fields[x][y].used = used;
};

var setNitrate = function (x, y, amount) {
    if (typeof x != 'number' || typeof y != 'number' || typeof amount != 'number') {
        throw new TypeError("x, y or amount isn't a number");
    } else if (x < 0 || y < 0 || amount < 0) {
        throw new RangeError('x, y or amount cannot be less than 0')
    } else if (!isInit) {
        throw new Error('not initialized')
    } else if (x > fields.length || y > fields[0].length) {
        throw new RangeError('x or y is bigger than the field')
    }
    fields[x][y].nitrate = amount;
};

function startModel() {
    // TODO: change 2,2 to what the farmer fills in
    genField(2, 2);
}
