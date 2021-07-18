#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const inspectFunc = require('./inspectFunc');
const utilsQuestion = require('../utils/utilsQuestion');
const listFunc = require('./listFunc');
const stopFunc = require('./stopFunc');

module.exports = {

    commitContainer: async function (containerAndImage) {
        console.log(`COMMIT container: ` + containerAndImage.ContainerName.green)
        var imageName = await utilsQuestion.makeQuestion(
            `Write the ${"name".green} of the ${"image".green}. ${"It is recommended to rename the image or it will be overwritten".brightRed}: `, 
            containerAndImage.ImageSource);
        var proceed = false;
        // check if there is an image with the same name
        do {
            var imageExists = listFunc.imageExists(imageName);
            if (imageExists == true) {
                var newImageName = await utilsQuestion.makeQuestion(
                    'There is an image with this name. Change the name or press enter to overwrite it: '.brightRed, 
                    imageName);
                if (newImageName == imageName) {
                    proceed = true;
                } else {
                    imageName = newImageName;
                }
            } else {
                proceed = true;
            }
        } while (proceed == false);

        var answer = await utilsQuestion.makeQuestion(
            `Do you want to create image ${imageName.green} from container ${containerAndImage.ContainerName.green} (y/n)? `, "", true);
        
        if (answer == true) {
            // check if container is stopped
            do {
                var stopContainer = false;
                var containerStatus = inspectFunc.getContainerStatus(containerAndImage.ContainerName);
                if (containerStatus != "exited") {
                    console.log(`Container ${containerAndImage.ContainerName.brightRed} is not stopped. ` + 
                        `Its status is ${containerStatus.toUpperCase().brightRed}. `);
                    console.log(`If an image is created from a not stopped container, the image data may be corrupted.`.brightRed);
                    stopContainer = await utilsQuestion.makeQuestion(
                        `Do you want to stop the container ${containerAndImage.ContainerName.green} (y/n)? `, "yes", true);
                    if (stopContainer == true) {
                        stopFunc.stopContainer(containerAndImage.ContainerName);
                    }
                }
            } while ((stopContainer == true) && (containerStatus != "exited"));
            process.stdout.write(`Creating image ${imageName.green} from container ${containerAndImage.ContainerName.green} ...`);
            try {
                execSync(`docker commit "${containerAndImage.ContainerName}" "${imageName}"`, {stdio: 'pipe'});
            } finally {
                console.log("");
                console.log("");
            }

            var imageExists = listFunc.imageExists(imageName);
            if (imageExists == true) {
                console.log("PROCESS FINISHED: ".green +
                    `Image ${imageName.green} created from container ${containerAndImage.ContainerName.green}`);
            } else {
                console.log("PROCESS FINISHED: ".brightRed +
                    `Image ${imageName.brightRed} NOT created from container ${containerAndImage.ContainerName.brightRed}`);
            }
        } else {
            console.log(`END. Container ${containerAndImage.ContainerName} has not been committed.`);
        }
    }

}
