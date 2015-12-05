var flower = require('flower')
var debug = require('debug')('stream-messenger')

module.exports = function (name, fnT, fnF) {
  var stream = flower(fnT, fnF);
  stream.name = name;

  var oldPipe = stream.pipe;
  stream.pipe = function (s, o) {
    s.on('message', function(message) {
      debug('%s: bubble up message %s', name, message.message)
      stream.emit('message', message)
    })
    s.on('error', function(error) {
      debug('%s: bubble up error %s', name, error)
      stream.emit('error', error)
    })
    return oldPipe.apply(stream, [].slice.apply(arguments));
  };

  return stream;
};
