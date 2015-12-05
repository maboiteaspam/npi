
var spawn       = require('child_process').spawn;
var streamMsger = require('./streammessenger')

module.exports = function (bin, args, opts) {

  var fnTransform = function (chunk, enc, cb) {
    var that  = this;
    var child = spawn(bin, args, opts);

    child.stdout.on('close', function childClose(){
      that.emit('message', {message:'spawned', body:child});
      cb(null, chunk);
    });

    that.emit('message', {message:'spawn', body:child, cmd: bin+' '+args.join(' ')});
  };

  return streamMsger('spawn', fnTransform);
};
