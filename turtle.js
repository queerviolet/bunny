var Turtle = (function() {

  var Turtle = function Turtle(pos, bearing) {
    this._bearing = bearing || [0, -1];
    this._pos = pos || [0, 0];
  };

  Turtle.prototype = Object.create(Piper.prototype);
  Turtle.prototype.constructor = Turtle;

  function deg2rad(deg) {
    return (deg / 180.0) * Math.PI;
  };

  Turtle.prototype.fwd = function(x) {
  	this.pos = this.pos.add(this.bearing.dotMul(x));
  	return this;
  };

  Turtle.prototype.back = function(x) {
  	this.pos = this.pos.add(this.bearing.dotMul(x).neg);
  	return this;
  };

  Turtle.prototype.left = function(x) {
  	return this.polr(x, Math.PI / 2.0);
  };

  Turtle.prototype.right = function(x) {
  	return this.polr(x, -Math.PI / 2.0);
  };

  Turtle.prototype.strafe = function(r, deg) {
  	return this.polr(r, deg2rad(deg));
  };

  Turtle.prototype.polr = function(r, rad) {
  	this.pos = this.pos.add(this.bearing.rot(rad).dotMul(r));
  	return this;
  };

  Turtle.prototype.turn = function(deg) {
  	return this.rot(deg2rad(deg));
  };

  Turtle.prototype.turnLeft = function(deg) {
  	return this.turn(deg);
  };

  Turtle.prototype.turnRight = function(deg) {
  	return this.turn(-deg);
  };

  Turtle.prototype.turnToward = function(light, by) {
  	if (by === undefined) {
  		by = 1.0;
  	}
  	var rad = this.bearing.angle(light.sub(this.pos));
  	if (Math.abs(rad) > Math.PI) {
  		rad = -(rad % Math.PI);
  	}
  	return this.rot(rad * by);
  };

  Turtle.prototype.rot = function(rad) {
  	this.bearing = this.bearing.rot2d(rad);
  	return this;
  };

  Turtle.prototype.spawn = function() {
  	return new Turtle(this.pos, this.bearing);
  };

  Turtle.prototype.polygon = function(n, length) {
  	var ang = 2 * Math.PI / n;
  	while (--n >= 0) {
  		this.fwd(length);
  		this.rot(ang);
  	}
  };

  Object.defineProperties (Turtle.prototype, {
    x: {
      enumerable: true,
      get: function() { return this.pos.x; },
      set: function(x) { this.pos = [x, this.pos.y]; },
    },
    y: {
      enumerable: true,
      get: function() { return this.pos.y; },
      set: function(y) { this.pos = [this.pos.x, y]; },
    },
    pos: {
    	enumerable: true,
    	get: function() { return this._pos; },
    	set: function(newPos) {
    		var old = this._pos;
    		this._pos = newPos;
    		this.emit(new Turtle.Step(old.to(newPos), this.bearing));
    	},
    },
    bearing: {
    	enumerable: true,
    	get: function() { return this._bearing; },
    	set: function(newBearing) {
    		var old = this._bearing;
    		this._bearing = newBearing;
    		this.emit(new Turtle.Step(this.pos, old.to(newBearing)));
    	},
    }
  });

  var Step = function(pos, bearing) {
  	this.pos = pos;
  	this.bearing = bearing;
  };

  Step.prototype.at = function(t) {
  	return {
  		pos: this.pos.at(t),
  		bearing: this.bearing.at(t)
  	};
  };

  Turtle.Step = Step;
  
  var Pen = function Pen(canvas) {
  	this.ctx = canvas.getContext('2d');
  	this.width = 1;
  	this.style = 'black';
  	this.drawing = true;
  };

  Pen.prototype = Object.create(Piper.prototype);
  Pen.prototype.constructor = Pen;

  Pen.prototype.up = function() {
  	this.drawing = false;
  };

  Pen.prototype.down = function() {
  	this.drawing = true;
  };

  Pen.prototype.push = function(step) {
  	Piper.call(this, step);

  	if (this.drawing) {
  		var ctx = this.ctx;  		
  		ctx.beginPath();
  		ctx.moveTo(step.pos.at(0).x, step.pos.at(0).y);
  		ctx.lineTo(step.pos.at(1).x, step.pos.at(1).y);
  		ctx.lineWidth = this.width;
  		ctx.strokeStyle = this.style;
  		ctx.stroke();
  	}
  };

  Turtle.Pen = Pen;

  var Subdiv = function Subdiv(maxLen) {
  	this.maxLen = maxLen;
  };

  Subdiv.prototype = Object.create(Piper.Mapper.prototype);
  Subdiv.prototype.constructor = Subdiv;

  Subdiv.prototype.func = function(step) {
  	if (!step.pos.range) {
  		return;
  	}

  	var stepLen = step.pos.range.mag;
  	var count = Math.ceil(stepLen / this.maxLen);
  	var prev = step.pos.at(0);
  	for (var i = 1; i <= count; ++i) {
  		var val = step.pos.at(i / count);
  		this.emit(new Turtle.Step(prev.to(val), step.bearing));
  		prev = val;
  	}
  };

  Turtle.Subdiv = Subdiv;


  var Sawtooth = function Sawtooth(neg) {
  	this.mul = neg? -1 : 1;
  };

  Sawtooth.prototype = Object.create(Piper.Mapper.prototype);
  Sawtooth.prototype.constructor = Sawtooth;

  Sawtooth.prototype.func = function(step) {
  	if (!step.pos.range) {
  		this.emit(step);
  		return;
  	}

  	var t = new Turtle();
  	t.pos = step.pos.at(0);
  	t.bearing = step.pos.range.unit;
  	t.receivers = this.receivers;
  	var qtr = 0.25 * step.pos.range.mag;
  	t.fwd(qtr);
  	t.turnLeft(this.mul * 45);
  	var len = Math.sqrt(0.125 * step.pos.range.magSquared);  	
  	t.fwd(len);
  	t.turnRight(this.mul * 90);
  	t.fwd(len);
  	t.turnLeft(this.mul * 45);
  	t.fwd(qtr);
  	t.pos = step.pos.at(1);
  };

  Turtle.Sawtooth = Sawtooth;

  return Turtle;
})();
