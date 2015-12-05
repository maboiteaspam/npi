
var spawn       = require('./spawn')
var streamMsger = require('stream-messenger')

module.exports = function (modules) {

  var fnTransform = function (chunk, enc, cb) {
    var that = this;
    if (modules && modules.length) {
      var spawnStream = spawn('npm', ['i'].concat(modules).concat('--save'), {stdio: 'pipe'});
      spawnStream.on('message', function (message) {
        that.emit('message', message)
        if (message.message=='spawned') {
          cb(null, chunk)
        }
      });
      spawnStream.write(chunk)
    } else {
      cb(null, chunk)
    }
  };

  return streamMsger('npm i', fnTransform);
};
