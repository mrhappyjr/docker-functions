#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const inspectFunc = require('./inspectFunc');
const listFunc = require('./listFunc');
const stopFunc = require('./stopFunc');
const utilsQuestion = require('../utils/utilsQuestion');

module.exports = {

    removeContainer: async function (container) {
        console.log(`REMOVE container: ` + container.green)
        // check if container is stopped
        var containerStatus;
        do {
            var stopContainer = false;
            containerStatus = inspectFunc.getContainerStatus(container);
            if (containerStatus != "exited") {
                console.log(`  Container ${container.brightRed} is not stopped. ` + 
                    `Its status is ${containerStatus.toUpperCase().brightRed}. `);
                console.log(`  If the container is not stopped, it will not be removed.`.brightRed);
                stopContainer = await utilsQuestion.makeQuestion(
                    `  Do you want to stop the container ${container.green} (y/n)? `, "yes", true);
                if (stopContainer == true) {
                    stopFunc.stopContainer(container);
                }
            }
        } while ((stopContainer == true) && (containerStatus != "exited"));

        if (containerStatus && containerStatus == "exited") {
            process.stdout.write(`  Removing container ${container.green} ... `);
            try {
                execSync(`docker container rm ${container}`, {stdio: 'pipe'});
            } finally {
                if (listFunc.containerExists(container) == true) {
                    console.log(`ERROR`.brightRed);
                } else {
                    console.log(`SUCCESS`.green);
                }
                console.log("");
            }
        } else {
            console.log(`  Container ${container.brightRed} will not be removed because its status is ${containerStatus.brightRed}.`);
        }
    },

    removeImage: async function (image) {
        console.log(`REMOVE image: ` + image.green)
        // check if image has associated containers
        var containerStatus;
        do {
            var stopContainer = false;
            containerStatus = inspectFunc.getContainerStatus(container);
            if (containerStatus != "exited") {
                console.log(`  Container ${container.brightRed} is not stopped. ` + 
                    `Its status is ${containerStatus.toUpperCase().brightRed}. `);
                console.log(`  If the container is not stopped, it will not be removed.`.brightRed);
                stopContainer = await utilsQuestion.makeQuestion(
                    `  Do you want to stop the container ${container.green} (y/n)? `, "yes", true);
                if (stopContainer == true) {
                    stopFunc.stopContainer(container);
                }
            }
        } while ((stopContainer == true) && (containerStatus != "exited"));

        if (containerStatus && containerStatus == "exited") {
            process.stdout.write(`  Removing container ${container.green} ... `);
            try {
                execSync(`dockerXXXXXXXXXX image rm ${container}`, {stdio: 'pipe'});
            } finally {
                if (listFunc.containerExists(container) == true) {
                    console.log(`ERROR`.brightRed);
                } else {
                    console.log(`SUCCESS`.green);
                }
                console.log("");
            }
        } else {
            console.log(`  Container ${container.brightRed} will not be removed because its status is ${containerStatus.brightRed}.`);
        }
    }

}
