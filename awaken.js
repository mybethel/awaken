#!/usr/bin/env node
const path = require('path');

const worker = process.argv[2];
const args = process.argv[3];
const script = require(path.resolve(process.cwd(), worker));

var hooks = path.resolve(path.dirname(worker), 'hooks');

var before = () => new Promise(resolve => resolve());
var after = () => new Promise(resolve => resolve());

try {
  var beforeHook = require(path.resolve(hooks, 'before'));
  before = beforeHook;
} catch(e) {}

try {
  var afterHook = require(path.resolve(hooks, 'after'));
  after = afterHook;
} catch(e) {}

before(args)
  .then(start => script.run(args)
    .then(result => after(result, start)
      .then(() => process.exit())))
        .catch(err => process.exit(1));
