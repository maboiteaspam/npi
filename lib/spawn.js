
var spawn       = require('spawn-cmd').spawn;
var streamMsger = require('stream-messenger')

module.exports = function spawnT (bin, args, opts, copyFn) {

  var fnTransform = function (chunk, enc, cb) {
    var that  = this;

    var childArgs = args || [];
    if (typeof childArgs === 'function') {
      childArgs = childArgs()
      if (childArgs===false) return cb(null, chunk);
    }

    if (!opts) opts = {}
    if (!opts.stdio) opts.stdio = 'inherit';

    var child = spawn(bin, childArgs, opts);

    child.on('error', function (err){if (!opts.silent) console.error(err)})

    child.on('close', function childClose(){
      process.nextTick(function () {          // delay a little a bit in order to let node close stdout/stderr
        // if stdio was 'inherits'. process close event !== process pipes closed
        that.emit('message',
          {message:'spawned', body:child});
        cb(null, chunk);
      })
    });

    if (copyFn) copyFn(child);

    that.emit('message', {message:'spawn', body:child, cmd: bin+' '+childArgs.join(' ')});
  };

  return streamMsger('spawn', fnTransform);
};
