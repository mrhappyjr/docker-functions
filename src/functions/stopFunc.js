#! /usr/bin/env node
const execSync = require('child_process').execSync;

module.exports = {

    stopContainer: function (container) {
        var stop = execSync(`docker stop ${numbersToStop}`).toString();
    }

}
