// Global variables
var lengthSquare = 0;   // Length of side of square dirt
var fields = [];       // List of squares that the farmer has
var isInit = false;     // True if the fields var is initialized
var canvasShape = null;
var canvasValues = null;
var inputContainer = null;
var inputLists = null;
var canvasContainerShape = null;
var canvasContainerValues = null;
var cards = null;
var squareWidth = null;
var resizeContainer = null;
var soilType = null;
var yieldPrevYear = null;
var nitrateAvrPrevYear = null;
var yieldOffset = null;

var lastX = 0;
var lastY = 0;

var formOpen = 0;

$(document).ready(function () {

    if(checkMobile()){
      alert("This site is best used not on mobile, as some of the elements will not scale with the screen");
    }

    checkImg();

    cards = $('.card');
    inputContainer = $('#inputContainer');
    inputLists = $('.inputList');
    canvasContainerShape = $('#canvas-container-shape');
    canvasContainerValues = $('#canvas-container-values');
    resizeContainer = $('.resize-container');
    canvasShape = $('#canvasShape');
    canvasValues = $('#canvasValues');

    // Prevent children updating width trigger
    inputLists.bind('transitionend', function (event) {
        if (event.target != $('.inputList.active')[0]) {return}
        setCanvas(canvasShape, fields.length, fields[0].length);
        setCanvas(canvasValues, fields.length, fields[0].length);
        redrawCanvas(canvasShape);
        redrawCanvas(canvasValues);
    });


    //handle the submit event for the input form
    $("#new_input").submit(function (event) {
        event.preventDefault();
        setNitrate(lastX, lastY, Number($('#nitrate').val()));
        drawSquare(lastX, lastY, canvasValues);
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
          if(getIsUsed(lastX,lastY)){
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
                $('#nitrate').focus();
            }
            return false;
          }
          else {
            alert("This is not a usable square");
          }
        });


        $('.close').on('click', function () {
            alert("close");
            deselect($('.inputDialog'));
            return false;
        });
    });

    //check if any squares are no longer used.
    $('#nextbtn').on('click', function(){
      validateUsed(canvasValues);
    });

});

// Public
var initialize = function (widthField, heightField, length) {
    if (typeof widthField != 'number' || typeof heightField != 'number' || typeof length != 'number') {
        throw new TypeError("x, y or length isn't a number");
    } else if (widthField < 1 || heightField < 1 || length < 1) {
        throw new RangeError('x, y and length cannot be less than 1')
    }
    checkImg();
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

// Public, returns amount of nitrate in kg/ha
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

    if (maxWidth <= 0 || maxHeight <= 0) {return;}

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
function startModel(soil, yieldPrev, nitrateAvr) {
    storeVariables(soil, yieldPrev, nitrateAvr);
    calcOutput();
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

// returns yield in ton/ha. expects x to be in kg/ha
var calcYield = function (x, offset=5.9366) {
    //y = -0,0005x2 + 0.297x + offset
    if (typeof x != 'number' || typeof offset != 'number') {
        throw new TypeError("x of offset isn't a number.");
    }
    return (((-0.0005) * Math.pow(x, 2)) + (0.297 * x) + offset);
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

//If a fields is not in use, reset the value to 0 and redraw.
function validateUsed(canvas){
  for(i = 0; i < fields.length;i++){
    for(j = 0; j < fields[i].length; j++){
      if(!getIsUsed(i,j)){
        setNitrate(i, j, 0);
        drawSquare(i,j,canvas);
      }
    }
  }
}

function redrawCanvas(canvas){
  for(i = 0; i < fields.length;i++){
    for(j = 0; j < fields[i].length; j++){
      drawSquare(i,j,canvas);
    }
  }
}

var nextPage = function(wideInput = false) {
    var current = $(".inputList.active");
    $(".inputList.active").next().addClass("active");
    current.removeClass("active");

    if (wideInput) {
        $('#inputContainer').attr('style', 'width: 80%;');
        $('#outputContainer').attr('style', 'width: 20%');
    }else {
        $('#inputContainer').attr('style', '');
        $('#outputContainer').attr('style', '');
    }
};

var prevPage = function(wideInput = false) {
    var current = $(".inputList.active");
    $(".inputList.active").prev().addClass("active");
    current.removeClass("active");

    if (wideInput) {
        $('#inputContainer').attr('style', 'width: 80%;');
        $('#outputContainer').attr('style', 'width: 20%');
    }else {
        $('#inputContainer').attr('style', '');
        $('#outputContainer').attr('style', '');
    }
};

function checkMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var calcOffset = function (area) {
    if (typeof area != 'number') {
        throw new TypeError("area isn't a number.")
    } else if (nitrateAvrPrevYear == null) {
        throw new Error("nitrateAvrPrevYear isn't defined.")
    }
    return yieldPrevYear * area - calcYield(nitrateAvrPrevYear, 0) * area;  // correct
};

// returns to be added nitrate in kg/ha. expects N to be in kg/ha
var calcSoilFormula = function (N) {
    if (typeof N != 'number') {
        throw new TypeError("N needs to be a number.")
    } else if (!isInit) {
        throw new Error("isn't initialized.")
    }
    switch(soilType) {
        case 'sand':
            // 300 - 1,8 * (N-mineral 0-60 cm)
            return Math.max(300 - 1.8 * N, 0);  // Math.min to prevent negative numbers. Can only add nitrate, not remove it
            break;
        case 'clay':
            // 285 - 1,1 * (N-mineral 0-60 cm)
            return Math.max(285 - 1.1 * N, 0);  // Math.min to prevent negative numbers. Can only add nitrate, not remove it
            break;
        default:
            throw new Error("soilType isn't either 'sand' or 'clay'.")
    }
};

var calcOutput = function () {
    var squareHa = Math.pow(lengthSquare, 2) / 10000;   // area square in ha

    var totalNitrate = 0;   // kg
    var amount_squares = 0;
    for (var x = 0; x < fields.length; x++) {
        for (var y = 0; y < fields[0].length; y++) {
            if (getIsUsed(x, y)) {
                amount_squares++;
                totalNitrate += getNitrate(x, y) * squareHa;    // kg/ha * ha -> kg
            }
        }
    }
    var totalArea = Math.pow(lengthSquare, 2) * amount_squares / 10000; // total hectares
    // Calc the offset
    yieldOffset = calcOffset(totalArea);    // offset to be used in formula, has no unit

    var nitrateAvr = totalNitrate / amount_squares; // kg/square
    var nitrateAvrPerHa = nitrateAvr / squareHa; // nitrate per square divided by the area of a square in ha. kg/ha
    var nitrateGift = calcSoilFormula(nitrateAvrPerHa); // kg/ha
    var totalYieldOld = 0;  // tonnes
    var totalYieldNew = 0;  // tonnes

    for (var x = 0; x < fields.length; x++) {
        for (var y = 0; y < fields[0].length; y++) {
            if (getIsUsed(x, y)) {
                var totalNitratePerHa = nitrateGift + getNitrate(x, y);  // kg/ha + kg/ha
                totalYieldOld += calcYield(totalNitratePerHa, yieldOffset) * squareHa;  // add (tonne/ha * ha) of a square
                totalNitratePerHa = calcSoilFormula(getNitrate(x, y)) + getNitrate(x, y); // kg/ha + kg/ha
                totalYieldNew += calcYield(totalNitratePerHa, yieldOffset) * squareHa;  // add (yield/ha * ha) of a square
            }
        }
    }

    var yieldAvrOld = totalYieldOld / totalArea;
    var yieldAvrNew = totalYieldNew / totalArea;
    $('#oldTotalYield').html(Math.round(totalYieldOld));
    $('#oldHaYield').html(Math.round(yieldAvrOld));

    $('#newTotalYield').html(Math.round(totalYieldNew));
    $('#newHaYield').html(Math.round(yieldAvrNew));

    $('#changeTotalYield').html(Math.round(totalYieldNew - totalYieldOld));
    $('#changeHaYield').html(Math.round(yieldAvrNew - yieldAvrOld));
};

var storeVariables = function (soil, yieldPrev, nitrateAvr) {
    if (soil == undefined || yieldPrev == undefined || nitrateAvr == undefined) {
        throw new Error('Value is undefined.');
    } else if (typeof soil != 'string') {
        throw new TypeError('soil needs to be a string.');
    } else if (typeof yieldPrev != 'number' || typeof nitrateAvr != 'number') {
        throw new TypeError('yieldPrev and nitrateAvr need to be a number.')
    }
    soilType = soil;
    yieldPrevYear = yieldPrev;
    nitrateAvrPrevYear = nitrateAvr;
};

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;
