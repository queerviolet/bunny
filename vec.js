Object.defineProperties (Array.prototype, {
	x: {
		enumerable: false,
		get: function() { return this.at(0); }
	},
	y: {
		enumerable: false,
		get: function() { return this.at(1); }
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
	}
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
	}
});

Array.prototype.at = function at(/* coords */) {
	return Array.prototype.slice.apply(arguments).reduce(function(x, i) {
		return x[i];
	}, this);
}

Number.prototype.at = function at(/* coords */) {
	return this.valueOf();
}

Array.prototype.add = function add(other) {
	var i = this.length;
	var r = [];
	while(--i >= 0) {
		r.unshift(this.at(i) + other.at(i));
	}
	return r;
};

Number.prototype.add = function add(other) {
	return this.valueOf() + other.at(0);
};

Array.prototype.sub = function sub(other) {
	var i = this.length;
	var r = [];
	while(--i >= 0) {
		r.unshift(this.at(i) - other.at(i));
	}
	return r;
};

Number.prototype.sub = function sub(other) {
	return this.valueOf() - other.at(0);
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
		r.unshift(this.at(i) * other.at(i));
	}
	return r;
};

Number.prototype.dotMul = function dotMul(other) {
	return this.valueOf() * other.at(0);
};

Array.prototype.dotDiv = function dotDiv(other) {
	var i = this.length;
	var r = [];
	while (--i >= 0) {
		r.unshift(this.at(i) / other.at(i));
	}
	return r;
};

Number.prototype.dotDiv = function dotDiv(other) {
	return this.valueOf() / other.at(0);
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

Array.prototype.unit = function unit() {
	return this.dotMul(1 / this.mag);
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




var vec = vec || {};
vec.add = function add(a, b) {
	if (!Array.isArray(a)) {
		return a + b;
	}
	var result = a.slice();
	for (var i = 0; i != result.length; ++i) {
		result[i] += b[i];
	}
	return result;
};

vec.subtract = function subtract(a, b) {
	if (!Array.isArray(a)) {
		return a - b;
	}	
	var result = a.slice();
	for (var i = 0; i != result.length; ++i) {
		result[i] -= b[i];
	}
	return result;
};

vec.set = function(/* elements... */) {
	var elements = Array.prototype.slice.apply(arguments);
	var constants = {};
	var evals = [];
	for (var i = 0; i != elements.length; ++i) {
		var el = elements[i];
		if (typeof el == 'function') {
			evals.push(el);
		} else {
			constants[el.toString()] = true;
		}
	}
	return function(x) {
		if (constants[x]) {
			return true;
		}
		for (var i = 0; i != evals.length; ++i) {
			if (evals[i](x)) {
				return true;
			}
		}
		return false;
	};
};


vec.rot2 = function rot2(v, rad) {
	var cos = Math.cos(rad);
	var sin = Math.sin(rad);
	return [v[0] * cos + v[1] * sin,
            -v[0] * sin + v[1] * cos];
};

vec.dot = function dot(a, b) {
	var sum = 0;
	for (var i = 0; i != a.length; ++i) {
		sum += a[i] * b[i];
	}
	return sum;
};

vec.angleBetween = function angleBetween(a, b) {
	return Math.acos(vec.dot(a, b) / (vec.mag(a) * vec.mag(b)));
};

vec.magSquared = function magSquared(v) {
	if (!Array.isArray(v)) {
		return v * v;
	}	
	var sq = 0;
	for (var i = 0; i != v.length; ++i) {
		sq += v[i] * v[i];
	}
};

vec.mag = function mag(v) {
	if (!Array.isArray(v))
		return v;
	return Math.sqrt(vec.magSquared(v));
};

vec.reflect = function reflect(v, mirror) {
	return vec.rot2(v, 2 * vec.angleBetween(v, mirror));
};

vec.scale = function scale(v, scalar) {
	if (!Array.isArray(v)) {
		return v * scalar;
	}		
	var result = v.slice();
	for (var i = 0; i != result.length; ++i) {
		result[i] *= scalar;
	}
	return result;
};


vec.clamp01 = function(x) {
	if (x < 0) return 0;
	if (x > 1) return 1;
};

vec.clamp = function clamp(min, max) {
	min = min || 0;
	max = max || 1;
	if (min == 0 && max == 1) {
		return vec.clamp01;
	}
	return function(x) {
		if (x < min) return min;
		if (x > max) return max;
		return x;
	}
};

vec.time = vec.time || {};
vec.time.dur = function(millis) {
	var now = performance.now();
	return vec.domain(now, now + millis).pipe(vec.clamp());
};

vec.EPSILON = 1e-32;
// Find the limit of func as its parameter goes from start to lim. func is
// never evaluated at lim. Return when the approximation is stable to within
// epsilon (if not specified, will be vec.EPSILON).
//
// Func can return vectors. From and lim cannot currently be vectors.
//
// Note that if Math.abs(lim) is Infinity, we assume it's the infinity on the
// same side as start. That is, vec.limit(f, -10, Infinity) will look for the
// limit at -Infinity.
vec.limit = function(func, from, lim, epsilon) {
	var x = from;
	if (Number.isFinite(lim)) {
		var next = function(x) {
			return lim + (x - lim) / 2;
		}
	} else {
		var next = function(x) { return x * 2; }		
	}
	var error = Number.MAX_VALUE;
	var x = from;
	do {
		var v1 = func(x);
		x = next(x);
		var v2 = func(x);
		error = vec.subtract(v2, v1);
	} while (vec.mag(error) > epsilon);
	return v2;
}


// Parametric functions
vec.parametric = function(func) {
	var P = function(t, time) {
		return func.apply(this, [t, time]);
	};
	P.pathLength = func.pathLength || vec.limit.bind(null, function(dt) {
		var t = 1.0;
		var clamp = vec.clamp();
		var len = 0.0;
		while(t > 0) {
			len += vec.mag(vec.subtract(func(t), func(clamp(t - dt))))
			t -= dt;
		}
		console.log(len);
		return len;
	}, 0.1, 0.0);
	return P;
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