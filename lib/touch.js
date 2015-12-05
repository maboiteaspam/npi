
var fs = require('fs');
var streamMsger = require('./streammessenger')

module.exports = function (file, content) {

  var fnTransform = function (chunk, enc, cb) {
    var that = this;

    fs.writeFile(file, content || '', function (err) {
      if(!err) that.emit('message', {message: 'file', body: file});
      cb(err, chunk);
    });
  };

  return streamMsger('touch', fnTransform);
};
