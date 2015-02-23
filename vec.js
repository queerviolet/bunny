"use strict";

/* vector math */
(function() {
	Object.defineProperties (Array.prototype, {
		x: {
			enumerable: false,
			get: function() { return this.get(0); }
		},
		y: {
			enumerable: false,
			get: function() { return this.get(1); }
		},
		xy: {
			enumerable: false,
			get: function() { return [this.x, this.y]; }
		},
		yx: {
			enumerable: false,
			get: function() { return [this.y, this.x]; }
		},
		str: {
			enumerable: false,
			get: function() {
				return '(' + this.join(',') + ')';
			}
		},
		mag: {
			enumerable: false,
			get: function() {
				return Math.sqrt(this.magSquared);
			}
		},
		magSquared: {
			enumerable: false,
			get: function() {
				return this.dotMul(this).reduce(function(x, y) { return x + y; });
			}
		},
		neg: {
			enumerable: false,
			get: function() {
				return this.map(function(x) { return x.neg; });
			}
		},
		unit: {
			enumerable: false,
			get: function() {
				return this.dotMul(1 / this.mag);
			},
		},
	});

	Object.defineProperties (Number.prototype, {
		x: {
			enumerable: false,
			get: function() { return this.valueOf(); }
		},
		y: {
			enumerable: false,
			get: function() { return this.valueOf(); }
		},
		xy: {
			enumerable: false,
			get: function() { return [this.valueOf(), this.valueOf()]; }
		},
		yx: {
			enumerable: false,
			get: function() { return [this.valueOf(), this.valueOf()]; }
		},
		str: {
			enumerable: false,
			get: function() {
				return this.toString();
			}
		},
		mag: {
			enumerable: false,
			get: function() {
				return this.valueOf();
			}
		},
		magSquared: {
			enumerable: false,
			get: function() {
				return this.valueOf() * this.valueOf();
			}
		},
		neg: {
			enumerable: false,
			get: function() {
				return -this.valueOf();
			}
		},
	});

	Array.prototype.get = function get(i) {
    return this[i];
	};

	Number.prototype.get = function get(/* coords */) {
		return this.valueOf();
	};

	Array.prototype.at = function(t) {
		return this;
	};

	Number.prototype.at = function(t) {
		return this.valueOf();
	};

  Number.prototype.gauss = function gauss(stdev) {
    var a = (2 * Math.random()) - 1.0;
    var b = (2 * Math.random()) - 1.0;
    var c = (2 * Math.random()) - 1.0;
    var g = a + b + c;
    if (stdev !== undefined) {
      g *= stdev; 
    }
    return this.valueOf() + g;
  };

  Array.prototype.gauss = function gauss(stdev) {
    var i = this.length;
    var r = [];
    while(--i >= 0) {
      r.unshift(this.get(i).gauss(stdev));
    }
    return r;
  };

  var Lerp = function(from, to) {
    this.from = from;
    this.to = to;
    this.range = this.to.sub(this.from);
  };

  Lerp.prototype.at = function(t) {
    return this.from.add(this.range.dotMul(t));
  };

  Array.prototype.to = function to(max) {
    return new Lerp(this, max);
  };

	Array.prototype.add = function add(other) {
		var i = this.length;
		var r = [];
		while(--i >= 0) {
			r.unshift(this.get(i) + other.get(i));
		}
		return r;
	};

	Number.prototype.add = function add(other) {
		return this.valueOf() + other.get(0);
	};

	Array.prototype.sub = function sub(other) {
		var i = this.length;
		var r = [];
		while(--i >= 0) {
			r.unshift(this.get(i) - other.get(i));
		}
		return r;
	};

	Number.prototype.sub = function sub(other) {
		return this.valueOf() - other.get(0);
	};

	Array.prototype.rot2d = function rot2d(rad) {
		var cos = Math.cos(rad);
		var sin = Math.sin(rad);
		return [this.x * cos + this.y * sin,
		        -this.x * sin + this.y * cos];
	};

	Array.prototype.dot = function dot(other) {
		return this.dotMul(other).reduce(function(x, y) {
			return x + y;
		});
	};

	Array.prototype.dotMul = function dotMul(other) {
		var i = this.length;
		var r = [];
		while (--i >= 0) {
			r.unshift(this.get(i) * other.get(i));
		}
		return r;
	};

	Number.prototype.dotMul = function dotMul(other) {
		return this.valueOf() * other.get(0);
	};

	Array.prototype.dotDiv = function dotDiv(other) {
		var i = this.length;
		var r = [];
		while (--i >= 0) {
			r.unshift(this.get(i) / other.get(i));
		}
		return r;
	};

	Number.prototype.dotDiv = function dotDiv(other) {
		return this.valueOf() / other.get(0);
	};

	Array.prototype.angle = function angle(other) {
		return Math.acos(this.dot(other) / (this.mag * other.mag));
	};

	Array.prototype.reflect2d = function reflect2d(other) {
		return this.rot2d(2 * this.angle2d(other));
	};

	Array.prototype.linearTo = function linear(end) {
		var range = end.sub(this);
		return function(t) {
			return this.add(range.dotMul(t));
		};
	};

	Number.prototype.clamp = function clamp(min, max) {
		return Scalar.clamp(this.valueOf(), min, max);	
	};

	var Scalar = Scalar || {};

	Scalar.clamp = function(v, min, max) {
		var min = min || 0;
		var max = max || 1;	
		if (v < min) return min;
		if (v > max) return max;
		return v;
	};


	(function(){

	/**
	 * Decimal adjustment of a number.
	 *
	 * @param	{String}	type	The type of adjustment.
	 * @param	{Number}	value	The number.
	 * @param	{Integer}	exp		The exponent (the 10 logarithm of the adjustment base).
	 * @returns	{Number}			The adjusted value.
	 */
	 function decimalAdjust(type, value, exp) {
		// If the exp is undefined or zero...
		if (typeof exp === 'undefined' || +exp === 0) {
			return Math[type](value);
		}
		value = +value;
		exp = +exp;
		// If the value is not a number or the exp is not an integer...
		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
			return NaN;
		}
		// Shift
		value = value.toString().split('e');
		value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
		// Shift back
		value = value.toString().split('e');
		return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	// Decimal round
	if (!Math.round10) {
		Math.round10 = function(value, exp) {
			return decimalAdjust('round', value, exp);
		};
	}
	// Decimal floor
	if (!Math.floor10) {
		Math.floor10 = function(value, exp) {
			return decimalAdjust('floor', value, exp);
		};
	}
	// Decimal ceil
	if (!Math.ceil10) {
		Math.ceil10 = function(value, exp) {
			return decimalAdjust('ceil', value, exp);
		};
	}

})();
})();


