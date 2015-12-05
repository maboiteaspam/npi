
var spawn       = require('./spawn')
var streamMsger = require('stream-messenger')

module.exports = function () {

  var fnTransform = function (chunk, enc, cb) {
    var that = this;
    var modules = (chunk.body.m || chunk.body.modules || '');
    if (modules && modules.length) {
      var spawnStream = spawn('npm', ['i'].concat(modules.split(/\s+/)).concat('--save'), {stdio: 'pipe'});
      spawnStream.on('message', function (message) {
        that.emit('message', message)
      });
      spawnStream.write(chunk)
    }
    cb(null, chunk)
  };

  return streamMsger('npm i', fnTransform);
};
