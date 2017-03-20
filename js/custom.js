// Global variables
var lengthSquare = 0;   // Length of side of square dirt
var fields = [];       // List of squares that the farmer has
var isInit = false;     // True if the fields var is initialized
var canvasShape = null;
var canvasValues = null;
var inputContainer = null;
var cards = null;
var squareWidth = null;

$(document).ready(function () {
    // TODO: start remove, only here for easy testing
    initialize(10, 12, 6);  // To init everything for easy testing


    // TODO: end remove
    cards = $('.card');
    inputContainer = $('#inputContainer');
    canvasShape = $('#canvasShape');
    canvasValues = $('#canvasValues');

    // Prevent children updating width trigger
    cards.bind('transitionend', function (event) {
        event.stopPropagation();
    });
    inputContainer.bind('transitionend', function () {
        setCanvas(canvasShape, fields.length, fields[0].length);
        setCanvas(canvasValues, fields.length, fields[0].length);
    });


    //handle the submit event for the input form
    $("#new_input").submit(function (event) {
        event.preventDefault();
        alert($('#nitrate').val());
        deselect($('#new_input'))
    });

    //handles opening of an input dialog
    $(function () {
        $('.inputDialog').on('click', function () {
            if ($(this).hasClass('selected')) {
                deselect($(this));
            } else {
                $(this).addClass('selected');
                $('.pop').slideFadeToggle();
            }
            return false;
        });

        $('.close').on('click', function () {
            deselect($('.inputDialog'));
            return false;
        });
    });

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
            fields[i][j] = {
                'used': false,
                'nitrate': 0
            };
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
    } else if (x >= fields.length || y >= fields[0].length) {
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
    } else if (x >= fields.length || y >= fields[0].length) {
        throw new RangeError('x or y is bigger than the field')
    }
    fields[x][y].nitrate = amount;
};

var getNitrate = function (x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number");
    } else if (x < 0 || y < 0) {
        throw new RangeError('x or y cannot be less than 0')
    } else if (!isInit) {
        throw new Error('not initialized')
    } else if (x >= fields.length || y >= fields[0].length) {
        throw new RangeError('x or y is bigger than the field')
    }
    return fields[x][y].nitrate;
};

var getIsUsed = function (x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number");
    } else if (x < 0 || y < 0) {
        throw new RangeError('x or y cannot be less than 0')
    } else if (!isInit) {
        throw new Error('not initialized')
    } else if (x >= fields.length || y >= fields[0].length) {
        throw new RangeError('x or y is bigger than the field')
    }
    return fields[x][y].used;
};

var setCanvas = function (canvas, x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number")
    } else if (x < 1 || y < 1) {
        throw new RangeError('x and y needs to be at least 1')
    }
    var maxWidth = inputContainer.width() - 71;     // card has twice 35px padding and 1 for the border
    var maxHeight = inputContainer.height() - 116;  // card has twice 35px padding and 45 for the buttons and 1 for the border
    if (maxWidth / x < maxHeight / y) {
        squareWidth = maxWidth / x;
    } else {
        squareWidth = maxHeight / y;
    }
    canvas[0].width = squareWidth * x;
    canvas[0].height = squareWidth * y;
    var context = canvas[0].getContext("2d");
    var opts = {
        distance: squareWidth,
        lineWidth: 1,
        gridColor: "#000000",
        caption: false,
        horizontalLines: true,
        verticalLines: true
    };
    new Grid(opts).draw(context);
};

var canvasClick = function (canvas, event) {
    if (typeof canvas != 'string') {
        throw new TypeError('canvas needs to be a string');
    } else if (!isInit) {
        throw new Error('not initialized')
    }
    event = event || window.event;
    switch (canvas) {
        case 'shape':
            canvas = canvasShape;
            break;
        case 'values':
            canvas = canvasValues;
            break;
        default:
            throw new Error("canvas needs to be either 'shape' or 'values'")
    }

    var x = Math.floor((event.pageX - canvas[0].offsetLeft) / squareWidth);
    var y = Math.floor((event.pageY - canvas[0].offsetTop) / squareWidth);

    switch (canvas) {
        case canvasShape:
            // Toggle if square is used or not
            setUsed(x, y, !getIsUsed(x, y));
            drawSquare(x, y, canvasShape);
            drawSquare(x, y, canvasValues);
            break;
        case canvasValues:
            // TODO: do something with the coordinates
            break;
        default:
            throw new Error("canvas needs to be either 'shape' or 'values'")
    }
};

// Method to draw a square a color dependent on if it is selected or not
var drawSquare = function (x, y, canvas) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number")
    } else if (canvas == undefined) {
        throw new Error('canvas is undefined')
    } else if (!isInit) {
        throw new Error('not initialized')
    }
    var context = canvas[0].getContext("2d");
    if (getIsUsed(x, y)) {
        context.fillStyle = '#ff0000';
    } else {
        context.fillStyle = '#ffffff';
    }
    context.fillRect(1 + x * squareWidth, 1 + y * squareWidth, squareWidth - 1, squareWidth - 1);
};

function startModel() {

}

//sets form values to empty string and remove the selected classs
function deselect(e) {
    $('.pop').slideFadeToggle(function () {
        $('#nitrate').val(" ");
        e.removeClass('selected');
    });
}

//slide animation for the form
$.fn.slideFadeToggle = function (easing, callback) {
    return this.animate({opacity: 'toggle', height: 'toggle'}, 'fast', easing, callback);
};
