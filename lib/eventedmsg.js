
var flower = require('flower')

module.exports = function () {
  var stream = flower();
  var stdin = function(chunk) {
    stream.write(chunk);
  };
  return {
    stdin: stdin,
    stdout: stream
  }
};
