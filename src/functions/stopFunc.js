#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const inspectFunc = require('./inspectFunc');

module.exports = {

    stopContainer: function (container) {
        process.stdout.write(`  Stopping container: ` + container.green + ` ... `)
        execSync(`docker stop ${container}`);

        var status = inspectFunc.getContainerStatus(container);
        process.stdout.write(`Status = `);
        var message = (status == "running") ? `CONTAINER STILL RUNNING`.brightRed : status.toUpperCase().green;
        console.log(message);
    },

    stopContainers: function (containers) {
        console.log(`  Stopping containers: ${containers.join(" # ").green} ... `)
        execSync(`docker stop ${containers.join(" ")}`);

        console.log("");
        containers.forEach(container => {
            process.stdout.write(`  Container ${container} `);
            var status = inspectFunc.getContainerStatus(container);
            process.stdout.write(`Status = `);
            var message = (status == "running") ? `CONTAINER STILL RUNNING`.brightRed : status.toUpperCase().green;
            console.log(message);
        });
    }

}
