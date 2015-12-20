#!/usr/bin/env node

function usage () {/*

 Usage
   npi [module1 module2]
   npi [opts] -- [module1 module2]

 Options
   -v             verbose
   -h             show help
   -b             add bin.js
   --explicit     invoke rvagg/node-explicit --yes.

 Examples
   npi debug set-verbosity show-help
   npi -b -- debug set-verbosity show-help
   npi -v -- debug set-verbosity show-help

   npi --explicit
   npi -h
 */}

var argv = require('minimist')(process.argv.slice(2));
require('set-verbosity')('npi', process.argv);
var pkg = require('./package.json')
require('show-help')(usage, process.argv, pkg)


require('console.md')();

var eventStream   = require('event-stream-writer')
var streamMsger   = require('stream-messenger')
var messageRouter = require('stream-message-router')
var regular       = require('@maboiteaspam/npi-regular')
var spawn         = require('@maboiteaspam/npi-utils/spawn')
var extract       = require('@maboiteaspam/npi-utils/extract')
var pipeSpawned   = require('@maboiteaspam/npi-utils/pipespawned')


console.log('npi %s', pkg.version)

var npi = regular(pkg, argv)
npi.on('error', function (err) {
  console.error('GOT ERROR %j', err);
});


var explicit = messageRouter('explicit');
explicit
  .pipe(spawn('node', [__dirname+'/node_modules/npm-explicit-deps/bin/npm-explicit-deps.js', '-y']))


var main = streamMsger('main');
main.pipe(npi);
main.pipe(explicit);


var msgListener = eventStream('message', main);
msgListener
  .pipe(messageRouter('file'))
  .pipe(extract('body', function (file) {
    console.mdline("file\t`%s`", file)
  }));

msgListener
  .pipe(messageRouter('spawn'))
  .pipe(extract('cmd', function (cmd) {
    console.mdline("spawn\t`%s`", cmd)
  }))
  .pipe(pipeSpawned());



main.write({
  message : argv.explicit?'explicit':'npi',
  body    : argv
});
