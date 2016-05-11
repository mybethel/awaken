const Heroku = require('heroku-client');
const path = require('path');

function Awaken(token, commandDirectory) {
  this.token = token;
  this.commands = path.resolve(process.cwd(), commandDirectory || './workers');
  this.client = new Heroku({ token: this.token });
}

Awaken.prototype.run = function(script, dynoSize, args) {
  return new Promise((resolve, reject) => {
    if (!script) return reject(new Error('A valid script is required to run'));

    if (!this.client || !process.env.HEROKU_APP) {
      return this.local(script, args);
    }

    herokuClient.dynos().create({
      command: `awaken ${path.join(this.commands, script)} ${args}`,
      size: dynoSize || 'Free',
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

Awaken.prototype.local = function(script, args) {
  script = require(path.join(this.commands, script));

  return new Promise((resolve, reject) => {
    if (typeof script.run !== 'function')
      return reject(new Error('Requested script is missing a run function'));

    return script.run(args);
  });
};

module.exports = Awaken;
