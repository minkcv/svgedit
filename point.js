var Point = function(x, y, previous, next, id) {
    this.x = x;
    this.y = y;
    this.normal = 'none';
    this.next = next;
    this.previous = previous;
    this.color = "#000000";
    this.id = id;
    this.selectionMargin = 20;
    //midpoint coordinates
    this.computeNormal();
};

Point.prototype.computeNormal = function() {
    if(this.next) {
        this.xLength = this.next.getX() - this.x;
        this.yLength = this.next.getY() - this.y;
        this.lineLength = Math.sqrt(Math.pow(this.xLength, 2) + Math.pow(this.yLength, 2));
        this.mx = this.x + this.xLength / 2;
        this.my = this.y + this.yLength / 2;
    }
}

Point.prototype.setNext = function(next) {
    this.next = next;
    this.computeNormal();
};
Point.prototype.getPrevious = function() {
    return this.previous;
};
Point.prototype.setPrevious = function(previous) {
    this.previous = previous;
};
Point.prototype.getID = function() {
    return this.id;
};
Point.prototype.getX = function() {
    return this.x;
};
Point.prototype.getY = function() {
    return this.y;
};

Point.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.computeNormal();
    if(this.previous) {
        this.previous.computeNormal();
    }
};
Point.prototype.getMiddleX = function() {
    return this.mx;
}
Point.prototype.getMiddleY = function() {
    return this.my;
}
Point.prototype.getXLength = function() {
    return this.xLength;
};
Point.prototype.getYLength = function() {
    return this.yLength;
};
Point.prototype.getLineLength = function() {
    return this.lineLength;
};
Point.prototype.getNext = function() {
    return this.next;
};
Point.prototype.getColor = function() {
    return this.color;
};
Point.prototype.checkInClick = function(x, y) {
    return x > this.x - this.selectionMargin / 2 && x < this.x + this.selectionMargin / 2 &&
            y > this.y - this.selectionMargin / 2 && y < this.y + this.selectionMargin / 2;
};
Point.prototype.getSelectionMargin = function() {
    return this.selectionMargin;
};
Point.prototype.getNormalType = function() {
    return this.normal;
};
Point.prototype.changeNormal = function() {
    if(this.normal == 'none') {
        this.normal = 'left';
    }
    else if(this.normal == 'left') {
        this.normal = 'right';
    }
    else if(this.normal == 'right') {
        this.normal = 'both';
    }
    else if(this.normal == 'both') {
        this.normal = 'none';
    }
};