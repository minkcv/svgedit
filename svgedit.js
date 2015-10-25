var pointCount = 0;
var svgX = 0;
var svgY = 0;
var svgWidth = 500;
var svgHeight = 500;
var mouseX = 0;
var mouseY = 0;
var pointDivWidth = '5px';
var pointDivHeight = '5px';
var selectedPoint;
var mode;
var pointsByID = {}; // all points by id in JSON
var svg;
var svgdiv;
var canvas; // for showing selections and other graphics that are not part of the svg
var ctx; // canvas context
document.captureEvents(Event.MOUSEMOVE);
document.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

var changeMode= function(mode) {
    this.mode = mode;
    var modeText = document.getElementById('currentmode');
    modeText.innerHTML = mode;
    displayChangeNormal(mode == 'select points' && selectedPoint);
};

var displayChangeNormal = function(display) {
    if(display) {
        document.getElementById('actions').style.display = 'block';
    }
    else {
        document.getElementById('actions').style.display = 'none';
    }
}

var displayInfo = function(display) {
    if(display) {
        document.getElementById('info').style.display = 'block';
    }
    else {
        document.getElementById('info').style.display = 'none';
    }
}

var action = function(a) {
    if(a == 'change normal') {
        if(selectedPoint)
            selectedPoint.changeNormal();
    }
    updateHTML();
    updateCanvas();
};

window.onload = function() {
    svgdiv = document.getElementById('svgdiv');
    svgdiv.style.width = svgWidth;
    svgdiv.style.height = svgHeight;
    svg = document.getElementById('svg');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    var rect = svgdiv.getBoundingClientRect();
    svgX = rect.left;
    svgY = rect.top;
    canvas = document.getElementById('canvas');
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = svgX;
    canvas.style.top = svgY;
    ctx = canvas.getContext('2d');
    changeMode("select points");
};

var svgClick = function() {
    var x = mouseX - svgX;
    var y = mouseY - svgY;
    
    if(mode == 'select points') {
        selectedPoint = pickPoint(x, y);
        displayChangeNormal(selectedPoint);
    }
    else if(mode == 'add points') {
		if(selectedPoint && selectedPoint.getNext() && selectedPoint.getPrevious()) {
			alert("point already has two connections");
		}
		else {
	        addPoint(x, y, selectedPoint);
		}
    }
    else if(mode == 'remove points') {
        var pointToRemove = pickPoint(x, y);
        removePoint(pointToRemove);
        if(pointToRemove && pointToRemove == selectedPoint) {
            if(selectedPoint.getPrevious()) {
                selectedPoint = selectedPoint.getPrevious();
            }
            else if(selectedPoint.getNext()) {
                selectedPoint = selectedPoint.getNext();
            }
            else {
                selectedPoint = null;
            }
        }
    }
    else if(mode == 'connect points') {
        if(selectedPoint) {
            var chosenPoint = pickPoint(x, y);
            if(chosenPoint && !chosenPoint.getNext()) {
                chosenPoint.setNext(selectedPoint);
                if(selectedPoint.getPrevious())
                    selectedPoint.getPrevious().setNext(null);
                selectedPoint.setPrevious(chosenPoint);
            }
            else if(chosenPoint && !chosenPoint.getPrevious()) {
                chosenPoint.setPrevious(selectedPoint);
                if(selectedPoint.getNext())
                    selectedPoint.getNext().setPrevious(null);
                selectedPoint.setNext(chosenPoint);
            }
            else if(chosenPoint) {
                alert('point already has two connections');
            }
        }
        else {
            alert('please select a point first');
        }
    }
    else if(mode == 'move points') {
        selectedPoint = pickPoint(x, y);
    }
    if(selectedPoint) {
        displayInfo(true);
        var nodes = document.getElementById('info').childNodes;
        var next;
        var prev;
        for(var i = 0; i < nodes.length; i++) {
            if(nodes[i].id == 'next')
                next = nodes[i];
            else if(nodes[i].id == 'prev')
                prev = nodes[i];
        }
        next.innerHTML = 'Next: ' + Boolean(selectedPoint.getNext());
        prev.innerHTML = 'Previous: ' + Boolean(selectedPoint.getPrevious());
    }
    else {
        displayInfo(false);
    }

    updateCanvas();
    updateHTML();
};

var svgRelease = function() {
    if(mode == 'move points' && selectedPoint) {
        var x = mouseX - svgX;
        var y = mouseY - svgY;
        selectedPoint.setPosition(x, y);
        updateCanvas();
        updateHTML();
    }
}

var pickPoint = function(x, y) {
    for(var i in pointsByID) {
        var point = pointsByID[i];
        var pickedPoint;
        if(point && point.checkInClick(x, y)) {
            pickedPoint = point;
            break;
        }
    }
    return pickedPoint;
};

var addPoint = function(x, y, previousPoint) {
    if(previousPoint) {
		if(previousPoint.getNext()) {
			var newPoint = new Point(x, y, null, previousPoint, pointCount);
		    pointsByID[pointCount] = newPoint;
			previousPoint.setPrevious(newPoint);
			newPoint.setNext(previousPoint);
		}
		else {
			var newPoint = new Point(x, y, previousPoint, null, pointCount);
		    pointsByID[pointCount] = newPoint;
	        previousPoint.setNext(newPoint);
	        newPoint.setPrevious(previousPoint);
		} 
    }
	else {
		var newPoint = new Point(x, y, null, null, pointCount);
	    pointsByID[pointCount] = newPoint;
	}
    selectedPoint = newPoint;
    pointCount++;
};

var removePoint = function(pointToRemove) {
    if(pointToRemove){
       var id = pointToRemove.getID();
       if(pointsByID[id].getPrevious()) {
           var previous = pointsByID[id].getPrevious();
	       previous.setNext(null);
       }
       if(pointsByID[id].getNext()) {
	       var next = pointsByID[id].getNext();
           next.setPrevious(null);
       }
       pointsByID[id] = null;
    }
};


var updateHTML = function() {
    svgdiv.innerHTML = '';
    svgdiv.appendChild(svg);
    svgdiv.appendChild(canvas);
    svg.innerHTML = '';
    for(var i in pointsByID) {
        var point = pointsByID[i];
        if(point && point.getNext()) {
            var line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.id = point.getID();
            line.setAttribute('x1', point.getX());
            line.setAttribute('y1', point.getY());
            line.setAttribute('x2', point.getNext().getX());
            line.setAttribute('y2', point.getNext().getY());
            line.setAttribute('normal', point.getNormalType());
            line.style.stroke = point.getColor();
            svg.appendChild(line);
        }
    }
    var b64 = btoa(svg);
    var link = document.getElementById('download link');
    link.href='data:image/svg+xml;utf8,' + decodeURI(svg.outerHTML);
};

var updateCanvas = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(var i in pointsByID) {
		if(pointsByID[i]) {
            var point = pointsByID[i];
			var m = point.getSelectionMargin();
            if(point.getNext()) {
                ctx.strokeStyle = '#0000FF';
            }
            else {
                ctx.strokeStyle = '#000000';
            }
            
            if((selectedPoint && pointsByID[i].getID() != selectedPoint.getID()) || ! selectedPoint)
                ctx.strokeRect(point.getX() - m / 2, point.getY() - m / 2,
	                m, m);
			
            if(point.getNext()) {
                //crazy trigonometry with no sin/cos
                var mx = point.getMiddleX();
                var my = point.getMiddleY();
                var xLength = point.getXLength();
                var yLength = point.getYLength();
                var lineLength = point.getLineLength();
                var nx;
                var ny;
                var normalLength = 20;
                if(point.getNormalType() == 'left') {
                    nx = mx + normalLength * yLength / lineLength;
                    ny = my - normalLength * xLength / lineLength;
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                }
                else if(point.getNormalType() == 'right') {
                    nx = mx - normalLength * yLength / lineLength;
                    ny = my + normalLength * xLength / lineLength;
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                }
                else if(point.getNormalType() == 'both') {
                    nx = mx + normalLength * yLength / lineLength;
                    ny = my - normalLength * xLength / lineLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                    
                    nx = mx - normalLength * yLength / lineLength;
                    ny = my + normalLength * xLength / lineLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                }
                
                
            }
		}
	}
	if(selectedPoint) {
        ctx.strokeStyle = '#FF0000';
        var m = selectedPoint.getSelectionMargin();
        ctx.strokeRect(selectedPoint.getX() - m / 2, selectedPoint.getY() - m / 2,
                m, m);
    }
};
