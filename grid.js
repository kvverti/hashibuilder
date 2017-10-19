var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
var resultBlock = document.getElementById("result");
var bwidth = document.getElementById("width");
var bheight = document.getElementById("height");
var modifiers = document.getElementsByClassName("mod");
var PIX_PER_SQUARE = 40;

var board = {
    dots: [],
    bridges: {},
    selected: null,
    width: 8,
    height: 8,
    solve: false
};

function mkKey(dot1, dot2) {
    return "(" + dot1.x + "," + dot1.y + "),(" + dot2.x + "," + dot2.y + ")";
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = (board.width + 1) * PIX_PER_SQUARE;
    canvas.height = (board.height + 1) * PIX_PER_SQUARE;
    resultBlock.style.height = (canvas.height - 26) + "px";
    var idx;
    if(!board.solve) {
        for(idx = 1; idx <= board.width; idx++) {
            ctx.moveTo(idx * PIX_PER_SQUARE, PIX_PER_SQUARE);
            ctx.lineTo(idx * PIX_PER_SQUARE, board.height * PIX_PER_SQUARE);
        }
        for(idx = 1; idx <= board.height; idx++) {
            ctx.moveTo(PIX_PER_SQUARE ,idx * PIX_PER_SQUARE);
            ctx.lineTo(board.width * PIX_PER_SQUARE, idx * PIX_PER_SQUARE);
        }
        ctx.stroke();
    } else if(board.selected != null) {
        ctx.arc(board.selected.x * PIX_PER_SQUARE,
            board.selected.y * PIX_PER_SQUARE,
            PIX_PER_SQUARE / 2,
            0,
            2 * Math.PI);
        ctx.stroke();
    }
    for(var a in board.bridges) {
        var bridge = board.bridges[a];
        if(bridge.count == 2) {
            ctx.moveTo(bridge.a.x * PIX_PER_SQUARE - 2, bridge.a.y * PIX_PER_SQUARE - 2);
            ctx.lineTo(bridge.b.x * PIX_PER_SQUARE - 2, bridge.b.y * PIX_PER_SQUARE - 2);
            ctx.moveTo(bridge.a.x * PIX_PER_SQUARE + 2, bridge.a.y * PIX_PER_SQUARE + 2);
            ctx.lineTo(bridge.b.x * PIX_PER_SQUARE + 2, bridge.b.y * PIX_PER_SQUARE + 2);
        } else {
            ctx.moveTo(bridge.a.x * PIX_PER_SQUARE, bridge.a.y * PIX_PER_SQUARE);
            ctx.lineTo(bridge.b.x * PIX_PER_SQUARE, bridge.b.y * PIX_PER_SQUARE);
        }
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
        if(dot.value == dot.count) {
            ctx.beginPath();
            ctx.moveTo(x - PIX_PER_SQUARE / 3, y - PIX_PER_SQUARE / 3);
            ctx.lineTo(x + PIX_PER_SQUARE / 3, y + PIX_PER_SQUARE / 3);
            ctx.moveTo(x + PIX_PER_SQUARE / 3, y - PIX_PER_SQUARE / 3);
            ctx.lineTo(x - PIX_PER_SQUARE / 3, y + PIX_PER_SQUARE / 3);
            ctx.stroke();
        }
    }
}

function canvasClick(right) {
    var x = Math.round((event.clientX - canvas.getBoundingClientRect().left) / PIX_PER_SQUARE);
    var y = Math.round((event.clientY - canvas.getBoundingClientRect().top) / PIX_PER_SQUARE);
    if(x < 1 || x > board.width || y < 1 || y > board.height)
        return;
    var res;
    if(board.solve) {
        res = placeBridge(x, y, right);
    } else {
        res = placeDot(x, y, right);
    }
    drawBoard();
    return res;
}

function placeBridge(x, y, right) {
    if(right)
        return;
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        if(dot.x == x && dot.y == y) {
            if(board.selected == null) {
                board.selected = dot;
                return;
            } else {
                if(board.selected.x < dot.x || board.selected.y < dot.y)
                    return placeBridgeImpl(board.selected, dot);
                else
                    return placeBridgeImpl(dot, board.selected);
            }
        }
    }
    board.selected = null;
    
    function placeBridgeImpl(dot1, dot2) {
        if(dot1.x == dot2.x && dot1.y == dot2.y
            || dot1.x != dot2.x && dot1.y != dot2.y) {
            board.selected = null;
            return;
        }
        var key = mkKey(dot1, dot2);
        if(dot1.count == dot1.value || dot2.count == dot2.value) {
            var c = board.bridges[key];
            if(c != null) {
                dot1.count -= c.count;
                dot2.count -= c.count;
                delete board.bridges[key];
            } else {
                board.selected = null;
            }
        } else if(board.bridges[key] != null) {
            var c = board.bridges[key];
            if(c.count == 1) {
                c.count = 2;
                dot1.count++;
                dot2.count++;
            } else {
                dot1.count -= 2;
                dot2.count -= 2;
                delete board.bridges[key];
            }
        } else if(validPlace(dot1, dot2)) {
            board.bridges[key] = { a: dot1, b: dot2, count: 1 };
            dot1.count++;
            dot2.count++;
        } else {
            board.selected = null;
        }
    }
    
    function validPlace(dot1, dot2) {
        for(var key in board.bridges) {
            var bridge = board.bridges[key];
            if((dot1.x > bridge.a.x && dot2.x < bridge.b.x
                && dot1.y < bridge.a.y && dot2.y > bridge.b.y)
            || (dot1.x < bridge.a.x && dot2.x > bridge.b.x
                && dot1.y > bridge.a.y && dot1.y < bridge.b.y))
                return false;
        }
        for(var i = 0; i < board.dots.length; i++) {
            var dot = board.dots[i];
            if((dot.x > dot1.x && dot.x < dot2.x
                && dot.y == dot1.y && dot.y == dot2.y)
            || (dot.y > dot1.y && dot.y < dot2.y
                && dot.x == dot1.x && dot.x == dot2.x))
                return false;
        }
        return true;
    }
}

function placeDot(x, y, right) {
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        if(dot.x == x && dot.y == y) {
            if(right) {
                board.dots.splice(i, 1);
                event.preventDefault();
                return false;
            } else if(dot.value == 8)
                dot.value = 1;
            else
                dot.value++;
            return;
        }
    }
    if(!right)
        board.dots.push({ x: x, y: y, value: 1, count: 0 });
}

function resetBoard() {
    board.dots.length = 0;
    drawBoard();
}

function setDims() {
    var w = parseInt(bwidth.value);
    var h = parseInt(bheight.value);
    if(w > 0 && h > 0) {
        var confirmed = false;
        for(var i = 0; i < board.dots.length; ) {
            var dot = board.dots[i];
            if(dot.x > w || dot.y > h) {
                if(confirmed || confirm("Some dots will be cleared. Continue?")) {
                    confirmed = true;
                    board.dots.splice(i, 1);
                } else
                    return;
            } else
                i++;
        }
        board.width = w;
        board.height = h;
        drawBoard();
    } else
        alert("Invalid dimensions");
}

function packBoard() {
    if(board.dots.length == 0)
        return;
    var minx = board.width;
    var maxx = 0;
    var miny = board.height;
    var maxy = 0;
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        minx = Math.min(minx, dot.x - 1);
        maxx = Math.max(maxx, dot.x);
        miny = Math.min(miny, dot.y - 1);
        maxy = Math.max(maxy, dot.y);
    }
    for(var i = 0; i < board.dots.length; i++) {
        var dot = board.dots[i];
        dot.x -= minx;
        dot.y -= miny;
    }
    board.width = maxx - minx;
    board.height = maxy - miny;
    bwidth.value = board.width;
    bheight.value = board.height;
    drawBoard();
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

function toggleMode() {
    board.solve ^= true;
    for(var i = 0; i < modifiers.length; i++) {
        modifiers[i].disabled = board.solve;
    }
    board.bridges = {};
    board.selected = null;
    for(var i = 0; i < board.dots.length; i++) {
        board.dots[i].count = 0;
    }
    drawBoard();
}
drawBoard();