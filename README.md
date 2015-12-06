# npi

Node Project Init

## Install

    npm i maboiteaspam/npi -g

## Usage

    npi [--verbose|-v] [-- module1 module2]
    npi [module1 module2]

## Flow

```js
var ignored = [
  'node_modules/',
  'npm-debug.log'
];

var templateVars = {
  name        : path.basename(process.cwd()),
  description : "Description of the module.",
  ignored     : ignored,
  modules     : argv['_']
};

npi
  .pipe(spawn('npm', ['init', '--yes'],
    {stdio: 'inherit'}))
  .pipe(bubble('message',
    {message: 'file', 'body':'package.json'}))
  .pipe(spawn('git', ['init'],
    {stdio: 'inherit'}))
  .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
  .pipe(genTemplate(tplPath, 'playground.js', templateVars))
  .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
  .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))
  .pipe(spawn('npm', function (){
    return ['i'].concat(argv['_']).concat('--save-dev')
  }, {stdio: 'inherit'}))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'inherit'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version],
    {stdio: 'inherit'}))
;
```

## Read more

- https://github.com/maboiteaspam/stream-messenger
- https://github.com/maboiteaspam/stream-message-router
- https://github.com/maboiteaspam/flower
- https://github.com/maboiteaspam/bubbler
- https://github.com/maboiteaspam/bubbled
- https://github.com/maboiteaspam/event-stream-writer
