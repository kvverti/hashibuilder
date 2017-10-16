var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
var resultBlock = document.getElementById("result");
var bwidth = document.getElementById("width");
var bheight = document.getElementById("height");
var PIX_PER_SQUARE = 40;

var board = {
    dots: [],
    width: 8,
    height: 8
};

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = (board.width + 1) * PIX_PER_SQUARE;
    canvas.height = (board.height + 1) * PIX_PER_SQUARE;
    result.style.height = canvas.height - 24;
    var idx;
    for(idx = 1; idx <= board.width; idx++) {
        ctx.moveTo(idx * PIX_PER_SQUARE, PIX_PER_SQUARE);
        ctx.lineTo(idx * PIX_PER_SQUARE, board.height * PIX_PER_SQUARE);
    }
    for(idx = 1; idx <= board.height; idx++) {
        ctx.moveTo(PIX_PER_SQUARE ,idx * PIX_PER_SQUARE);
        ctx.lineTo(board.width * PIX_PER_SQUARE, idx * PIX_PER_SQUARE);
    }
    ctx.stroke();
    for(idx = 0; idx < board.dots.length; idx++) {
        ctx.beginPath();
        var dot = board.dots[idx];
        var x = dot.x * PIX_PER_SQUARE;
        var y = dot.y * PIX_PER_SQUARE;
        ctx.moveTo(x + PIX_PER_SQUARE / 3, y);
        ctx.arc(x, y, PIX_PER_SQUARE / 3, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.font = "1.5em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(dot.value, x, y);
    }
}

function canvasClick(right) {
    var x = Math.round((event.clientX - canvas.getBoundingClientRect().left) / PIX_PER_SQUARE);
    var y = Math.round((event.clientY - canvas.getBoundingClientRect().top) / PIX_PER_SQUARE);
    if(x < 1 || x > board.width || y < 1 || y > board.height)
        return;
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        if(dot.x == x && dot.y == y) {
            if(right) {
                board.dots.splice(i, 1);
                drawBoard();
                event.preventDefault();
                return false;
            } else if(dot.value == 8)
                dot.value = 1;
            else
                dot.value++;
            drawBoard();
            return;
        }
    }
    if(!right)
        board.dots.push({ x: x, y: y, value: 1 });
    drawBoard();
}

function resetBoard() {
    board.dots.length = 0;
    drawBoard();
}

function setDims() {
    var w = parseInt(bwidth.value);
    var h = parseInt(bheight.value);
    if(w > 0 && h > 0) {
        if(board.dots.length == 0 || confirm("Board will be cleared. Continue?")) {
            board.dots.length = 0;
            board.width = w;
            board.height = h;
            drawBoard();
        }
    } else
        alert("Invalid dimensions");
}

function makeText() {
    var str = "";
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        str += (dot.x - 1) + " " + (board.height - dot.y) + " " + dot.value + "\n";
    }
    resultBlock.innerHTML = str;
}

function selectText() {
    
    resultBlock.focus();
    resultBlock.select();
}
drawBoard();