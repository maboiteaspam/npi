
var streamMsger = require('stream-messenger')
var spawn       = require('./spawn')


function spawnT (bin, args, fn, stream) {

  return spawn(bin, args, {stdio: 'pipe'}, function (child){
    var o = '';
    child[stream].on('data', function (d) {
      o+=''+d
    })
    child.on('close', function () {
      if (fn) fn(o)
    })
  });
}

spawnT.stdout = function (bin, args, obj, prop) {

  return spawnT(bin, args, function (stdout) {
    obj[prop] = stdout
  }, 'stdout');
}

spawnT.stderr = function (bin, args, obj, prop) {

  return spawnT(bin, args, function (stderr) {
    obj[prop] = stderr
  }, 'stderr');
}

module.exports = spawnT;
