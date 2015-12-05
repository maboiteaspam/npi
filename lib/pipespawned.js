
var streamMsger = require('stream-messenger')

module.exports = function (stdout, stderr) {

  var fnTransform = function (chunk, enc, cb) {

    chunk.body.stdout
    && chunk.body.stdout.pipe(stdout || process.stdout);

    chunk.body.stderr
    && chunk.body.stderr.pipe(stderr || process.stderr);

    cb(null, chunk);
  };

  return streamMsger('pipeSpawned', fnTransform);
};
