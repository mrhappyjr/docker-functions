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
                    `  Do you want to stop the container ${container.green} (y/n)? `, "", true);
                if (stopContainer == true) {
                    stopFunc.stopContainer(container);
                } else {
                    return; // if the container is not stopped, the method is exited.
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
        const iName = (image.ImageName && image.ImageName != "") ? image.ImageName : image.ImageId;
        const iId = image.ImageId;
        console.log(`REMOVE image: ` + iName.green)
        var removeImage = true;
        // check if image has associated containers
        var imageContainers = listFunc.imageContainers(iId, "ContainerName");
        if (imageContainers && imageContainers.length > 0) {
            console.log(`  Image ${iName.brightRed} has associated container${(imageContainers.length == 1) ? "" : "s"} ${imageContainers.join(" # ")}`);
            console.log(`  If the associated containers are not removed the image either.`.brightRed);
            var removeContainers = await utilsQuestion.makeQuestion(`  Do you want to remove the associated containers (y/n)? `, "", true);
            if (removeContainers == true) {
                for (const container of imageContainers) {
                    console.log("");
                    await this.removeContainer(container);
                }
                imageContainers = listFunc.imageContainers(iId, "ContainerName");
                if (imageContainers && imageContainers.length > 0) {
                    removeImage = false;
                    console.log(`  Image ${iName.brightRed} will not be removed because has associated container${(imageContainers.length == 1) ? "" : "s"} ${imageContainers.join(" # ")}`);
                }
            } else {
                removeImage = false;
            }
        }
        if (removeImage == true) {
            process.stdout.write(`  Removing image ${iName.green} ... `);
            try {
                execSync(`docker image rm ${iId}`, {stdio: 'pipe'});
            } finally {
                if (listFunc.imageExists(iId) == true) {
                    console.log(`ERROR`.brightRed);
                } else {
                    console.log(`SUCCESS`.green);
                }
                console.log("");
            }
        }
    }

}
