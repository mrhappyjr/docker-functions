#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const inspectFunc = require('./inspectFunc');

module.exports = {

    stopContainer: function (container) {
        process.stdout.write(`    Stopping container: ` + container.green + ` ... `)
        execSync(`docker stop ${container}`).toString();

        var status = inspectFunc.getContainerStatus(container);
        process.stdout.write(`Status = `);
        var message = (status == "running") ? `CONTAINER STILL RUNNING`.red : status.toUpperCase().green;
        console.log(message);
    }

}
