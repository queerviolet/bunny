function Turtle(pen) {
	this.pos = [0, 0];
	this.bearing = [0, 1];
	this.pen = pen || new Turtle.Pen();
}

Object.defineProperties(Turtle.prototype, {
	speed: {
		enumerable: false,
		get: function() { return this.pen.speed; },
		set: function(speed) { this.pen.speed = speed; }
	},
});

Turtle.prototype.go = function(distance) {
	var nextPos = this.pos.add(this.bearing.dotMul(distance));
	this.pen.stroke(this.pos.linearTo(nextPos));
	this.pos = nextPos;
}

Turtle.prototype.rotate = function(degrees) {
	this.rotateRad(360 / degrees * (Math.PI * 2));
}

Turtle.prototype.rotateRad = function(radians) {
	this.bearing = this.bearing.rot2d(radians);
//	this.pen.twist.enqueue(Turtle.rotate(radians));
}

Turtle.line = function(start, end, appearance) {
	var range = end.sub(this);
	var tan = range.unit;
	var norm = range.unit.rotate2d(-Math.PI / 2);
	return function(t) {
		return {
			pos: this.add(range.dotMul(t)),
			tan: tan,
			norm: norm
		};
	};
}

Turtle.Line = function(start, end, appearance) {
	this.start = start;
	this.end = end;
	this.range = end.sub(start);
	this.appearance = appearance;
};

Turtle.Line.prototype.value = function(t) {
	return this.start.add(this.range.dotMul(t));
};

Turtle.Line.prototype.draw = function(stage) {
	var pixels = stage.time * stage.renderer.speed;
	var t = (this.range.mag / this.pixels).clamp();
	stage.ctx.beginPath(); {
		stage.ctx.moveTo(this.start);
		stage.ctx.lineTo(t);
	} stage.ctx.endPath();
	return t < 1;
};

Turtle.Pen = function(canvas) {
	this.queue = [];
	this.stage = null;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
};

Turtle.Renderer.prototype.enqueue = function(command) {
	queue.push(command);
	requestAnimationFrame(this.draw.bind(this));
};

Turtle.Renderer.prototype.draw = function(time) {
	if (!this.stage) {
		if (queue.length > 0) {
			this.stage = new Turtle.Renderer.Stage(this, queue.unshift());
		} else {
			return true;
		}
	}

	var performanceContinues = stage.draw(time);
	if (!performanceContinues) {
		this.stage = null;
	}
};

Turtle.Renderer.Stage = function(canvas, actor) {

}



Turtle.CanvasProto = Object.create(HTMLCanvasElement.prototype);
Turtle.CanvasProto.getTurtle = function getTurtle() {
	if (!this.turtle) {
		this.renderer = new Turtle.Renderer(this);
		this.turtle = new Turtle(this.renderer);
	}
	return this.turtle;
}

document.registerElement('turtle-canvas', {
  prototype: Turtle.CanvasProto,
  extends: 'canvas'
})