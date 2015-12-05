#!/usr/bin/env node

if (process.argv.join(' ').match(/\s+(--verbose|-v)/)) process.env['DEBUG'] = [
  'bubbled',
  'message-router'
].join(' ')

require('console.md')();

var eventStream   = require('event-stream-writer')
var messageRouter = require('stream-message-router')
var minimisted    = require('./lib/minimisted')
var spawn         = require('./lib/spawn')
var touch         = require('./lib/touch')
var push          = require('./lib/push')
var extract       = require('./lib/extract')
var pipeSpawned   = require('./lib/pipespawned')
var npmInstall    = require('./lib/npminstall')


var pkg = require('./package.json')
var gitIgnored = [
  'node_modules/',
  'npm-debug.log'
];
var files = [];

console.log('npi %s', pkg.version)

var npi = messageRouter('npi');

npi
  .pipe(minimisted())
  .pipe(touch('package.json'))
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(touch('README.md', '# package\n\n## Install\n\n\tnpm i package --save-dev\n\n## Usage\n\n## More\n\n'))
  .pipe(touch('index.js'))
  .pipe(touch('.gitignore', gitIgnored.join('\n')))
  .pipe(touch('playground.js'))
  .pipe(npmInstall())
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))
;

npi.on('error', function (err) {
  console.error('GOT ERROR %j', err);
});


var msgListener = eventStream('message', npi);
msgListener
  .pipe(messageRouter('file'))
  .pipe(extract('body', function (file) {
    console.mdline("file\t`%s`", file)
  }))
  .pipe(push('body', files));

msgListener
  .pipe(messageRouter('spawn'))
  .pipe(extract('cmd', function (cmd) {
    console.log("")
    console.mdline("spawn\t`%s`", cmd)
  }))
  .pipe(pipeSpawned());


npi.write({
  message : 'npi',
  body    : process.argv
});
