#!/usr/bin/env node

if (process.argv.join(' ').match(/\s+(--verbose|-v)/)) process.env['DEBUG'] = [
  'stream-messenger',
  'message-router'
].join(' ')

var chalk = require('chalk');
require('console.md')({
  firstHeading: chalk.yellow.bold
});

var messageRouter = require('./lib/messagerouter')
var eventedMsg    = require('./lib/eventedmsg')
var minimisted    = require('./lib/minimisted')
var spawn         = require('./lib/spawn')
var touch         = require('./lib/touch')
var extract       = require('./lib/extract')
var pipeSpawned   = require('./lib/pipespawned')
var npmInstall    = require('./lib/npminstall')


var pkg = require('./package.json')
var gitIgnored = [
  'node_modules/',
  'npm-debug.log'
];

console.log('npi %s', pkg.version)

var npi = messageRouter('npi');

npi
  .pipe(minimisted())
  .pipe(spawn('npm', ['init', '--yes'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['init'], {stdio: 'pipe'}))
  .pipe(touch('index.js'))
  .pipe(touch('.gitignore', gitIgnored.join('\n')))
  .pipe(touch('playground.js'))
  .pipe(spawn('git', ['status'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['add', '-A'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['status'], {stdio: 'pipe'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version], {stdio: 'pipe'}))
  .pipe(npmInstall())
;

npi.on('error', function (err) {
  console.error('GOT ERROR %j', err);
});


var msgListener = eventedMsg();
msgListener.stdout
  .pipe(messageRouter('file'))
  .pipe(extract('body', console.mdline, "file\t`%s`"));

msgListener.stdout
  .pipe(messageRouter('spawn'))
  .pipe(extract('cmd', console.mdline, "spawn\t`%s`"))
  .pipe(pipeSpawned());

msgListener.stdout
  .pipe(messageRouter('spawned'))
  .pipe(extract(null, console.log, ""));

npi.on('message', msgListener.stdin);


npi.write({
  message : 'npi',
  body    : process.argv
});
