// Global variables
var lengthSquare = 0;   // Length of side of square dirt
var fields = [];       // List of squares that the farmer has
var isInit = false;     // True if the fields var is initialized
var canvasShape = null;
var canvasValues = null;
var inputContainer = null;
var canvasContainerShape = null;
var canvasContainerValues = null;
var cards = null;
var squareWidth = null;
var resizeContainer = null;

var lastX = 0;
var lastY = 0;

var formOpen = 0;

$(document).ready(function () {
    // TODO: fix enable square > set value > go back > disable square > square still green on second canvas

    cards = $('.card');
    inputContainer = $('#inputContainer');
    canvasContainerShape = $('#canvas-container-shape');
    canvasContainerValues = $('#canvas-container-values');
    resizeContainer = $('.resize-container');
    canvasShape = $('#canvasShape');
    canvasValues = $('#canvasValues');

    // Prevent children updating width trigger
    cards.bind('transitionend', function (event) {
        event.stopPropagation();
    });
    inputContainer.bind('transitionend', function () {
        checkImg();
        setCanvas(canvasShape, fields.length, fields[0].length);
        setCanvas(canvasValues, fields.length, fields[0].length);
    });


    //handle the submit event for the input form
    $("#new_input").submit(function (event) {
        event.preventDefault();
        if(getIsUsed(lastX,lastY)){
          setNitrate(lastX, lastY, Number($('#nitrate').val()));
          drawSquare(lastX, lastY, canvasValues);
        }
        else{
          alert("This is not a useable square");
        }
        formOpen = 0;
        deselect($('.inputDialog'));
    });

    $('#uploadWidget').submit(function(event){
      event.preventDefault();
      $('#someImg').src = $('#fileupload').val()
    })

    //handles opening of an input dialog
    $(function () {
        $('.inputDialog').on('click', function () {
            if ($(this).hasClass('selected')) {
                //deselect($(this));
            } else {
                $(this).addClass('selected');
                formOpen = 1;
                var nVal = getNitrate(lastX,lastY);
                if(nVal > 0){
                  $('#nitrate').val(nVal);
                }
                else{
                  $('#nitrate').val(" ");
                }
                $('.pop').slideFadeToggle();
            }
            return false;
        });

        $('.close').on('click', function () {
            alert("close");
            deselect($('.inputDialog'));
            return false;
        });
    });

});

// Public
var initialize = function (widthField, heightField, length) {
    if (typeof widthField != 'number' || typeof heightField != 'number' || typeof length != 'number') {
        throw new TypeError("x, y or length isn't a number");
    } else if (widthField < 1 || heightField < 1 || length < 1) {
        throw new RangeError('x, y and length cannot be less than 1')
    }
    var x = Math.ceil(widthField / length);
    var y = Math.ceil(heightField / length);
    setLengthSquares(length);
    genField(x, y);
    isInit = true;
};

// Private
var genField = function (x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number");
    }
    fields = [];
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

// Private
var setLengthSquares = function (length) {
    if (typeof length != 'number') {
        throw new TypeError("length isn't a number");
    } else if (length < 1) {
        throw new RangeError('length cannot be less than 1')
    }
    lengthSquare = length;
};

// Private
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

// Public
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

// Public
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

// Private
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

// Private
var setCanvas = function (canvas, x, y) {
    if (typeof x != 'number' || typeof y != 'number') {
        throw new TypeError("x or y isn't a number")
    } else if (x < 1 || y < 1) {
        throw new RangeError('x and y needs to be at least 1')
    }

    var maxWidth;
    var maxHeight;

    switch(canvas) {
        case canvasShape:
            maxWidth = canvasContainerShape.width() - 1; // -1 for border
            maxHeight = canvasContainerShape.height() - 1; // -1 for border
            break;

        case canvasValues:
            maxWidth = canvasContainerValues.width() - 1; // -1 for border
            maxHeight = canvasContainerValues.height() - 1; // -1 for border
            break;
    }

    if (maxWidth / x < maxHeight / y) {
        squareWidth = maxWidth / x;
    } else {
        squareWidth = maxHeight / y;
    }
    canvas[0].width = squareWidth * x;
    canvas[0].height = squareWidth * y;

    switch(canvas) {
        case canvasShape:
            canvasContainerShape.find('.resize-container').width(squareWidth * x);
            canvasContainerShape.find('.resize-container').height(squareWidth * y);
            break;

        case canvasValues:
            canvasContainerValues.find('.resize-container').width(squareWidth * x);
            canvasContainerValues.find('.resize-container').height(squareWidth * y);
            break;
    }

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

// Public
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
            if(!formOpen){
              lastX = x;
              lastY = y;
            }
            break;
        default:
            throw new Error("canvas needs to be either 'shape' or 'values'")
    }
};

// Private
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
    if (canvas == canvasValues && getNitrate(x, y) > 0) {
        context.fillStyle = '#00ff00'
    } else if (getIsUsed(x, y)) {
        context.fillStyle = '#ff0000';
    } else {
        context.fillStyle = '#ffffff';
    }
    context.fillRect(1 + x * squareWidth, 1 + y * squareWidth, squareWidth - 1, squareWidth - 1);
};

// Public
function startModel() {

}

//sets form values to empty string and remove the selected classs
function deselect(e) {
    $('.pop').slideFadeToggle(function () {
        e.removeClass('selected');
    });
}

//slide animation for the form
$.fn.slideFadeToggle = function (easing, callback) {
    return this.animate({opacity: 'toggle', height: 'toggle'}, 'fast', easing, callback);
};

// Hide img div if there is no img to show
var checkImg = function () {
    var src = $('#farmPic').attr('src');
    if (src == '#') {
        $('.resize-drag').hide();
    } else {
        $('.resize-drag').show();
    }
};

interact('.resize-drag')
    .draggable({
        onmove: window.dragMoveListener
    })
    .resizable({
        preserveAspectRatio: true,
        edges: { left: true, right: true, bottom: true, top: true }
    })
    .on('resizemove', function (event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0),
            y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width  = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        // target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
    });

    //take a filepath and set the src of an image tag
    function readURL(input) {
          if (input.files && input.files[0]) {
              var reader = new FileReader();

              reader.onload = function (e) {
                  $('#farmPic')
                      .attr('src', e.target.result);
              };

              reader.readAsDataURL(input.files[0]);
          }
      }

// target elements with the "draggable" class
interact('.draggable')
    .draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        restrict: {
            restriction: "parent",
            endOnly: true,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: true,

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
            var textEl = event.target.querySelector('p');

            textEl && (textEl.textContent =
                'moved a distance of '
                + (Math.sqrt(event.dx * event.dx +
                    event.dy * event.dy)|0) + 'px');
        }
    });

function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;