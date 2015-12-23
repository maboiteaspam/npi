# npi

Node Project Init. Way more than `npm init -y`.

## Install

    npm i @maboiteaspam/npi -g

## Usage

```bash
npi

 Init a node project.

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
```

## Workflow

Workflow is the stream that implement the initialization of the package.

Currently see `npi-regular` workflow.

Workflow are expected to create a
minimal environment to get on work,
cooked just for the user.

```
 - node_modules/
 - .gitignore
 - index.js
 - playground.js
 - package.json
 - README.md
```

Workflow must perform any action as automated as possible,
otherwise query for user input at runtime.

Workflow describes your habits, preferences,
environments requirements,
when its about a node package setup.

## Build your own

Please consider visiting

- https://github.com/maboiteaspam/npi-regular
- https://github.com/maboiteaspam/npi-utils

__tips__

Use `-v` to check the workflow errors while using `npi`.

```
npi -v -- mod1...
```

#### workflow signature

`workflow` are node module which exports a `function(pkg, argv, conf)`,
which must return a stream `bubbler`
(one of `stream-messenger`, `stream-router`, `bubbler`, `bubbled`).

A simple `workflow` would be

```js
    var messageRouter = require('stream-message-router')
    var npi = messageRouter('npi');
```

It is then possible to enhance the `workflow` in such way,

```js
    var trimT         = require('@maboiteaspam/npi-utils/trim.js')
    var spawn         = require('@maboiteaspam/npi-utils/spawn')
    var bubble        = require('@maboiteaspam/npi-utils/bubble')

    npi
    .pipe(trimT(templateVars, ['author']))
    .pipe(spawn('npm', function (){
        return ['init', '--scope='+templateVars.author, '--yes']
    }))
    .pipe(bubble('message', {message: 'file', 'body':'package.json'}))
```

the latter, the workflow is connected to npi `main` stream, and invoked when necessary.

## About the code

TLDR: It use a workflow stream `npi` on which transforms are piped to.

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

- https://github.com/maboiteaspam/npi-regular
- https://github.com/maboiteaspam/npi-utils
- https://github.com/maboiteaspam/stream-messenger
- https://github.com/maboiteaspam/stream-message-router
- https://github.com/maboiteaspam/flower
- https://github.com/maboiteaspam/bubbler
- https://github.com/maboiteaspam/bubbled
- https://github.com/maboiteaspam/event-stream-writer
- https://github.com/maboiteaspam/set-verbosity
- https://github.com/maboiteaspam/show-help


## Develop

```bash
mkdir npi
cd npi
git clone git@github.com:maboiteaspam/npi.git
git clone git@github.com:maboiteaspam/npi-utils.git
git clone git@github.com:maboiteaspam/npi-regular.git

cd npi
npm i && npm link ../npi-utils
npm i && npm link ../npi-regular

mkdir tomate
cd tomate
npi -d @maboiteaspam/npi-regular
npi --link ../npi-regular
npi
```

+/- like this.
