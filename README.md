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
  // npm init
  .pipe(spawn('npm', ['init', '--yes'],
    {stdio: 'inherit'}))
  .pipe(bubble('message',
    {message: 'file', 'body':'package.json'}))

  // gather user input
  .pipe(input('Input the module\'s description :',
    templateVars, 'description'))
  .pipe(input('Input the module\'s keywords :',
    templateVars, 'keywords'))
  .pipe(choose('Please choose a licence :',
    templateVars, 'licence'))
  .pipe( !argv['_'].length
    ? input('Input the module\'s dependencies :',
    templateVars, 'dependencies')
    : streamMsger('skip') )
  .pipe(input('Input the module\'s devDep\'s :',
    templateVars, 'devDependencies'))

   //generate templates
  .pipe(genTemplate(tplPath, 'README.md'    , templateVars))
  .pipe(genTemplate(tplPath, 'playground.js', templateVars))
  .pipe(genTemplate(tplPath, 'index.js'     , templateVars))
  .pipe(genTemplate(tplPath, '.gitignore'   , templateVars))

  // npm module install
  .pipe(spawn('npm', function (){
    var modules = templateVars.dependencies
      .replace(/^\s+/, '').replace(/\s+$/, '').split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save');
  }, {stdio: 'inherit'}))
  .pipe(spawn('npm', function (){
    var modules = templateVars.devDependencies
      .replace(/^\s+/, '').replace(/\s+$/, '').split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save-dev');
  }, {stdio: 'inherit'}))

  // fix package.json file
  .pipe(updatePkg('package.json', function () {
    return {
      licence         : templateVars.licence,
      description     : templateVars.description,
      keywords        : templateVars.keywords.split(/\s/)
    };
  }))

  // git init, add, commit
  .pipe(spawn('git', ['init'],
    {stdio: 'inherit'}))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }, {stdio: 'inherit'}))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version],
    {stdio: 'inherit'}))
;
```

## Pipe

I don t know if that helps :D

```js
        process
-▶-stdin-▶|                           (1)
          | var npi = stream()        /
          |   |.pipe() ▼             /
          |   |   route 'npi' -----▼
          |   |                    |
          |   |     (3)            |
          |   |     /              |
          |  npi   /               |
          |  emit(message)         |                      (2)
          |   ▼      ▲             |                      /
          |   |    bubble up       |-▶ fnT1 (spawn npm)  /
          |   |            ▲       |    ▼               /
          |   |        bubble up   |-▶ fnT2 -▶bubble event --▼
          |   |               ▲--◀ | ◀-------{type: 'file'   |
          |   |                    |    ▼     body: 'index'}◀|
          |   ▼                    |    ▼
          |   |                    |-▶ fnT3
          |   |         (4)        |    ▼
          |   |          \         |-▶ fnT4
          |   |           \        (end of npi)
          |   |            \
          |   ▶-▶ var msgListener = eventStream('message', npi);
          |        |.pipe() ▼
          |        |   route 'file' -▼                        (5)
          |        |                 |-▶ fnT1 (extract body)  /
          |        |                 |    ▼                  /
          |        |                 |-▶ console.log(chunk) /
          |        |                 (end of msgListener)
          |        |.pipe() ▼
          |            route 'spawn' -▼
          |                           |-▶ child.stdout.pipe(stdout)
          |                           |   child.stderr.pipe(stderr)
          |                           (end of msgListener)
◀-stdout-◀|
   (end of process)
```


## Read more

- https://github.com/maboiteaspam/stream-messenger
- https://github.com/maboiteaspam/stream-message-router
- https://github.com/maboiteaspam/flower
- https://github.com/maboiteaspam/bubbler
- https://github.com/maboiteaspam/bubbled
- https://github.com/maboiteaspam/event-stream-writer
