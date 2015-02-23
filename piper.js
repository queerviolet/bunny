var Piper = (function() {
  function Piper() { };

  Piper.prototype.pipe = function(receiver) {
    this.receivers = this.receivers || [];
    this.receivers.push(receiver);
    return receiver;
  };

  Piper.prototype.unpipe = function(receiver) {
    this.receivers = this.receivers || [];
    var index = this.receivers.index(receiver);
    if (index == -1) {
      return null;
    }
    var removed = this.receivers.splice(index, 1);
    if (this.receivers.length == 0) {
      delete this.receivers;
    }
    return removed;
  };

  Piper.prototype.emit = function(item) {
    if (typeof this.receivers == 'undefined') { return; }
    var i = this.receivers.length;
    while(--i >= 0) {
      this.receivers[i].push(item);
    }
  };

  Piper.prototype.push = function(item) {
    emit(item);
  };

  Piper.map = function(func) {
    return this.pipe(new Piper.Mapper(func));
  };

  Piper.Mapper = function Piper_Mapper(func) {
    if (func) {
      this.func = func;
    }
  };

  Piper.Mapper.prototype = Object.create(Piper.prototype);
  Piper.Mapper.prototype.constructor = Piper.Mapper;

  Piper.Mapper.prototype.push = function(item) {
    var result = this.func(item);
    if (result) {
      if (Array.isArray(results)) {
        var len = result.length;
        for (var i = 0; i != len; ++i) {
          this.emit(result[i]);
        }
      } else {
        this.emit(result);
      }
    }
  };

  return Piper;
})();