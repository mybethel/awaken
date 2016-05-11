# Awaken

Awaken dynos to do your bidding.

Allows you to relegate CPU-heavy or long-running tasks to an on-demand dyno.

Currently only Heroku dynos have been implemented. If a dyno is awoken from a
parent script which is not running on Heroku, the underlying script will be run
attached to the parent process. This is useful for local development/debugging.

## Usage

Scripts can be created in a folder local to your script. This defaults to
"workers." Each worker should export a `.run` function that returns a Promise
which is resolved when the worker has completed. Once the Promise has either
resolved or rejected the Heroku dyno will be destroyed.

**Ensure your worker scripts are fully tested before using a paid dyno. Heroku
will terminate long-running instances but this is still a fast way to rack up
a large bill!**

Additionally, you may add a `before` and `after` hook in a `hooks` directory
next to your worker scripts. These must export a function which returns a
Promise and will be executed before the worker is run and immediately afterwards
before the parent dyno is destroyed. This is entirely optional but can be useful
for setting up the environment your worker script needs to execute in.

```
workers/
  hooks/
    before.js
    after.js
  myWorker1.js
```

The following example awakens a dyno with the size "Standard-1X":

```
const Awaken = require('awaken');
const worker = new Awaken(process.env.HEROKU_API_TOKEN);

worker.run('myWorker1', 'Standard-1X')
  .then(console.log)
  .catch(console.error);
```
