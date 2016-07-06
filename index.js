const Heroku = require('heroku-client');
const path = require('path');

class Awaken {

  constructor(token, commandDirectory, app) {
    this.token = token;
    this.commands = path.resolve(process.cwd(), commandDirectory || './workers');
    this.client = new Heroku({ token: this.token }).apps(app || process.env.HEROKU_APP);
  }

  run(script, dynoSize, args) {
    return new Promise((resolve, reject) => {
      if (!script) return reject(new Error('A valid script is required to run'));

      if (!this.client || !process.env.HEROKU_APP) {
        return this.local(script, args);
      }

      this.client.dynos().create({
        command: `awaken ${path.join(this.commands, script)} ${args}`,
        size: dynoSize || 'Free',
      }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  local(script, args) {
    script = require(path.join(this.commands, script));

    return new Promise((resolve, reject) => {
      if (typeof script.run !== 'function')
        return reject(new Error('Requested script is missing a run function'));

      return script.run(args);
    });
  }
}

module.exports = Awaken;
