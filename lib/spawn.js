
var spawn       = require('child_process').spawn;
var streamMsger = require('stream-messenger')

module.exports = function (bin, args, opts) {

  var fnTransform = function (chunk, enc, cb) {
    var that  = this;

    var childArgs = args;
    if (typeof childArgs === 'function') childArgs = childArgs()

    var child = spawn(bin, childArgs, opts);

    child.on('close', function childClose(){
      process.nextTick(function () {          // delay a little a bit in order to let node close stdout/stderr
                                              // if stdio was 'inherits'. process close event !== process pipes closed
        that.emit('message',
          {message:'spawned', body:child});
        cb(null, chunk);
      })
    });

    that.emit('message', {message:'spawn', body:child, cmd: bin+' '+childArgs.join(' ')});
  };

  return streamMsger('spawn', fnTransform);
};
