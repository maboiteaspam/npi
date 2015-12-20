
var inquirer = require('inquirer');
var streamMsger = require('stream-messenger')

function inquireInput (what, obj, property) {

  return inquireInput.handle(what, function (answer) {
    obj[property] = answer
  });
}

inquireInput.handle = function (what, fn) {

  var fnTransform = function (chunk, enc, cb) {

    var questions = [
      {
        type: "input",
        name: "response",
        message: what
      }
    ];

    inquirer.prompt( questions, function( answers ) {
      if (fn) fn(answers['response'])
      cb(null, chunk)
    });

  };

  return streamMsger('inquire', fnTransform);

}

module.exports = inquireInput;
