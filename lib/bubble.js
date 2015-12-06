
var streamMsger = require('stream-messenger')

module.exports = function bubble (event, data) {

  var fnTransform = function (chunk, enc, cb) {
    if (typeof data === 'function') data = data(event, chunk);
    this.emit(event, data);
    cb(null, chunk);
  };

  return streamMsger('bubble', fnTransform);
};
