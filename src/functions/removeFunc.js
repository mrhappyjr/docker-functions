#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const inspectFunc = require('./inspectFunc');

module.exports = {

    removeContainer: function (container) {
        process.stdout.write(`    Removing container: ` + container.green + ` ... `)

        // check if container is stopped
        do {
            var containerStatus = inspectFunc.getContainerStatus(containerAndImage.ContainerName);
            if (containerStatus != "exited") {
                console.log(`Container ${containerAndImage.ContainerName.brightRed} is not stopped. ` + 
                    `Its status is ${containerStatus.toUpperCase().brightRed}. `);
                var stopContainer = await utilsQuestion.makeQuestion(
                    `Do you want to stop the container ${containerAndImage.ContainerName.green} (y/n)? `, "yes", true);
                if (stopContainer == true) {
                    stopFunc.stopContainer(containerAndImage.ContainerName);
                }
            }
        } while (containerStatus != "exited");

        //execSync(`docker stop ${container}`).toString();

        var status = inspectFunc.getContainerStatus(container);
        process.stdout.write(`Status = `);
        var message = (status == "running") ? `CONTAINER STILL RUNNING`.brightRed : status.toUpperCase().green;
        console.log(message);
    }

}
