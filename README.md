# npi

Node Project Init. A bit more than `npm init -y`.

## Install

    npm i maboiteaspam/npi -g

## Usage

      npi to init a node project.

      Usage
         npi [module1 module2]
         npi [opts] -- [module1 module2]

      Options
         -v             verbose
         -h             show help
         -b             add bin.js
         --explicit     invoke rvagg/node-explicit --yes.

     Examples
         npi debug minimist multiline
         npi -b -- debug minimist multiline
         npi -v -- debug minimist multiline

         npi --explicit
         npi -h

## Expected result

A minimal bunch of files to get on work, cooked just for you.

```
 - node_modules/
 - .gitignore
 - index.js
 - playground.js
 - package.json
 - README.md
```

Following `package.json` fields are updated with your input,

- description
- licence
- keyword

The resulting `package.json` provide a set of script,

#### npm run patch

To increase __patch__ number of your package revision.

#### npm run minor

To increase __minor__ number of your package revision.

#### npm run major

To increase __major__ number of your package revision.


The reason of this workflow is to enforce a better usage of `semver`.

Please check more about it at https://github.com/rvagg/npm-explicit-deps

Read also about `npm version` https://docs.npmjs.com/cli/version

There a also a command to check your dependencies status and know which needs to be updated to latest,

__npm run dcheck__ : Which runs `npm outdated --depth=0` under the hood.

### Complete your workflow

To go further you can check about those repo

- https://github.com/commitizen/cz-cli
- https://github.com/bahmutov/npm-module-checklist

There s also plenty of grunt, gulp and other modules if you like.

## Operations Flow

#### For humans only,

- npm init --yes
- ask you about module description
- ask you about module keywords
- ask you about module licence
- ask you about module dependencies, unless provided.
- ask you about module dev-dependencies
- generate your files
- npm i [your dependencies]
- npm i [your dev-dependencies]
- fix various things in the `package.json` file, for lazy people
- git init
- git add <generated files only>
- git commit -m 'npi:version'

#### Everyone else,

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
      scripts          : {
        "patch": "npm version patch -m \"patch %s\"",
        "minor": "npm version minor -m \"patch %s\"",
        "major": "npm version major -m \"patch %s\"",
        "preversion": "echo \"npm test: undefined\" && node node_modules/.bin/npm-explicit-deps -y",
        "version": "echo \"npm run build: undefined\"",
        "postversion": "git push && git push --tags"
      },
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

## About the code

TLDR: It use a main stream `npi` on which transforms are piped to.

They execute in sequence, time management is totally left to the underlying pipe system.

To communicate with the user along the commands, `npi` will bubble events to the `source` stream.

`msgListener` a dedicated stream is setup to listen `npi` stream  `message event`s.

It then route chunks to specific transforms which are responsible to display an output given the type of message.

The type of events you may encounter are

When a file is created : `{message: 'file', body:'path'}`

When a process spawns : `{message: 'spawn', body:child_process}`

When a process has spawned (child_process.close event) : `{message: 'spawned', body:child_process}`


May this drawing you to jump in the code,

```js
       process
-▶-stdin-▶|                       (1)
          | var npi = stream()    /
          |    .pipe() ▼         /
          |       route 'npi' -----▼
          |                        |
          |      (3)               |
          |      /                 |
          |  npi emit()◀--|        |
          |   ▼           |        |
          |  down         |        |
          |   ▼           ▲        |
          |   |    bubble()◀◀|     |-▶fnT1 (spawn npm)
          |   |              |           ▼ push()      (2)
          |   |              ▲           ▼            /
          |   |       bubble()◀◀|     fnT2 start bubble() ▶-|
          |   |                 |        ▼                  |
          |   |                 |        ▼  {type: 'file'   |
          |   |                 |------------body: 'index'}-|
          |   |                          ▼ push()
          |   |                       fnT3 (inquire)
          |   |                          ▼ push()
          |   |                       fnT4 (git commit)
          |   |                          ▼ push()
          |   |          (4)          (end of npi)
          |   |            \
          |   ▶-▶ var msgListener = eventStream('message', npi);
          |         .pipe() ▼
          |            route 'file' -▼
          |                          |-▶fnT1 (extract body)  (5)
          |                                 ▼ push()        /
          |                             fnT2 (log to console)
          |                                 ▼ push()
          |                             (end of msgListener)
          |     msgListener
          |         .pipe() ▼                            (5 bis)
          |            route 'spawn' -▼                 /
          |                           |-▶fnT1 (pipe to process)
          |                                 ▼ push()
          |                              (end of msgListener)
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
