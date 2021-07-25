const execSync = require('child_process').execSync;
const utilsString = require('./utilsString');

module.exports = {
  
  getLocalVersion: function () {
    try {
      return utilsString.replaceEOL(execSync(`dockerize --version`, {stdio: 'pipe'}).toString());
    } catch (exception) {
      return 'notFound';
    }
  },

  getLastVersion: function () {
    return utilsString.replaceEOL(execSync(`npm show @goldenrace/dockerize version`, {stdio: 'pipe'}).toString());
  }

};