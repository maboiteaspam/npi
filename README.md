# npi

Node Project Init. A bit more than `npm init -y`.

## Install

    npm i maboiteaspam/npi -g

## Usage

    npi

     Init a node project.

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

#### npm run dcheck

Check your dependencies status,
upgrade them if they are outdated.
under the hood, its `npm outdated --depth=0`.

__________

The reason of this workflow is to enforce a better usage of `semver`.

Please check more about it at https://github.com/rvagg/npm-explicit-deps

Read also about `npm version` https://docs.npmjs.com/cli/version

Finally, you can take advantage of `preversion` and `version` npm scripts to
invoke build and test frameworks.

### Complete your workflow

To go further you can check about those repo

- https://github.com/commitizen/cz-cli
- https://github.com/bahmutov/npm-module-checklist

There s also plenty of grunt, gulp and other modules if you like.

### Scoped package

`npi` make use of scoped package.

Following my personal disappointment about `show-help` package,
`npi` will use scoped package strategy by default.

It s a better to way to share the same resource all together.

- https://docs.npmjs.com/getting-started/scoped-packages
- http://blog.npmjs.org/post/116936804365/solving-npms-hard-problem-naming-packages

## Operations Flow

#### For humans only,

- npm init --yes
- ask you about module `description`
- ask you about module `keywords` (space delimited)
- ask you to choose a `licence`
- ask you about module `dependencies`, unless provided previously (space delimited)
- ask you about module `dev-dependencies` (space delimited)
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
  .pipe(spawn('npm', ['init', '--yes']))
  .pipe(bubble('message',
    {message: 'file', 'body':'package.json'}))

  // gather user input
  .pipe(input('Input the module\'s description :',
    templateVars, 'description'))
  .pipe(input('Input the module\'s keywords :',
    templateVars, 'keywords'))
  .pipe(choose('Please choose a license :',
    templateVars, 'license'))
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
  .pipe( argv.b
    ? genTemplate(tplPath,  'bin.js'        , templateVars)
    : streamMsger('skip') )

  // npm module install
  .pipe(spawn('npm', function (){
    var modules = trim(templateVars.dependencies).split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save');
  }))
  .pipe(spawn('npm', function (){
    var modules = trim(templateVars.devDependencies).split(/\s/);
    if (!modules.length || !modules[0].length) return false;
    return ['i'].concat(modules).concat('--save-dev');
  }))

  // fix package.json file
  .pipe(updatePkg('package.json', function () {

    return {
      scripts : {
        "dcheck"      : "npm outdated --depth=0",
        "patch"       : "npm version patch -m \"patch %s\"",
        "minor"       : "npm version minor -m \"minor %s\"",
        "major"       : "npm version major -m \"major %s\"",
        "preversion"  : "echo \"npm test: not defined\" && npi --explicit",
        "version"     : "echo \"npm run build: not defined\"",
        "postversion" : "git push && git push --tags"
      },
      bin             : templateVars.bin,
      license         : templateVars.license,
      description     : templateVars.description,
      keywords        : templateVars.keywords.split(/\s/)
    };
  }))

  // git init, add, commit
  .pipe(spawn('git', ['init']))
  .pipe(spawn('git', function (){
    return ['add'].concat(files)
  }))
  .pipe(spawn('git', ['commit', '-m', 'npi:'+pkg.version]))
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
- https://github.com/maboiteaspam/set-verbosity
- https://github.com/maboiteaspam/show-help
