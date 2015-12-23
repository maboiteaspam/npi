#!/usr/bin/env node

function usage () {/*
 Usage
   npi [module1 module2]
   npi [opts] -- [module1 module2]

   npi --explicit           Run explicit-deps
   npi --config             Show config
   npi --add [module]       Add workflow
   npi --default [module]   Set default workflow

 Options
   -v                       verbose
   -h                       show help
   -w                       Workflow to use
   --explicit               Invoke rvagg/node-explicit --yes.
   --add                    Add new init workflow.
   --default                Set the default workflow

 Examples
   npi debug minimist multiline
   npi -v -- debug minimist multiline
   npi -w @maboiteaspam/npi-regular -- debug minimist multiline

   npi --explicit
   npi -h
 */}

var pkg = require('./package.json')
var argv = require('minimist')(process.argv.slice(2));
var debug = require('@maboiteaspam/set-verbosity')(pkg.name, process.argv);
require('@maboiteaspam/show-help')(usage, process.argv, pkg)


require('@maboiteaspam/console.md')();

var Configstore   = require('configstore');
var eventStream   = require('@maboiteaspam/event-stream-writer')
var streamMsger   = require('@maboiteaspam/stream-messenger')
var messageRouter = require('@maboiteaspam/stream-message-router')
var spawn         = require('@maboiteaspam/npi-utils/spawn')
var extract       = require('@maboiteaspam/npi-utils/extract')
var pipeSpawned   = require('@maboiteaspam/npi-utils/pipespawned')
var print         = require('@maboiteaspam/npi-utils/print')
var notBool       = require('@maboiteaspam/npi-utils/not-bool')
var setConfig     = require('@maboiteaspam/npi-utils/set-config')


var action = 'npi';
if (argv.explicit)  action = 'explicit'
if (argv.add)       action = 'add'
if (argv.default)   action = 'default'
if (argv.config)    action = 'config'

var conf      = new Configstore(pkg.name, {workflow: ''});

var workflow  = argv.w || argv.workflow || conf.get('workflow') || '@maboiteaspam/npi-regular'

console.log('npi %s using %s', pkg.version, workflow)

var main = streamMsger('main')
try {
  var npi = messageRouter('npi')
  npi.pipe(require(workflow)(pkg, argv, conf))
  npi.on('error', function (err) {
    console.error('GOT ERROR %j', err);
  });
  main.pipe(npi);
}catch(ex){
  debug(ex)
  console.error('can not load workflow: '+workflow)
}

var explicit = messageRouter('explicit');
explicit
  .pipe(spawn('node', [
    __dirname+'/node_modules/npm-explicit-deps/bin/npm-explicit-deps.js',
    '-y'
  ]))

var add = messageRouter('add');
add.pipe(notBool(argv, 'add', 'a'))
  .pipe(spawn('npm', ['i', '--prefix', __dirname, (argv.add || argv.a)]))
  .pipe(setConfig(conf, 'workflow', __dirname+'/node_modules/'+(argv.add || argv.a), true))


var setDefault = messageRouter('default');
setDefault.pipe(notBool(argv, 'default', 'd'))
  .pipe(setConfig(conf, 'workflow', __dirname+'/node_modules/'+(argv.default || argv.d)))
  .pipe(spawn('npm', ['i', '--prefix', __dirname, (argv.default || argv.d)]))

var viewConfig = messageRouter('config');
viewConfig.pipe(print(JSON.stringify(conf.all, null, 4)))


main.pipe(explicit);
main.pipe(add);
main.pipe(setDefault);
main.pipe(viewConfig);


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
  message : action,
  body    : argv
});
