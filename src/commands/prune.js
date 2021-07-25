#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsQuestion = require('../utils/utilsQuestion');
const utilsLog = require('../utils/utilsLog');
const inspectFunc = require('../functions/inspectFunc');
const stopFunc = require('../functions/stopFunc');
const utilsArray = require('../utils/utilsArray');
const customErrors = require('../errors/customErrors');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: PRUNE", true, true, 100);

    try {
        console.log("DISK USAGE".green + " (command \"docker system df\")")
        console.log("")
        var result = execSync(`docker system df`, {stdio: 'pipe'});
        console.log(result.toString())

        var answerPrune = await utilsQuestion.makeQuestion(`Write the initials of what you want to prune:\n` +
            `  ${"\"c\"".green} (remove all stopped containers)\n` + 
            `  ${"\"i\"".green} (remove all images without at least one container associated to them)\n` + 
            `  ${"\"v\"".green} (remove all local volumes not used by at least one container)\n` + 
            `  ${"\"a\"".green} (remove containers, images and volumes)\n` + 
            `  ${"\"d\"".brightRed} (database entities will also be included in the pruning)\n` + 
            `in any order but together. For example \"cv\", \"vic\", etc.\n` +
            `Before pruning, the entities to prune will be seen: `);
        
        if (answerPrune && (answerPrune.toLowerCase().includes("c") || 
                            answerPrune.toLowerCase().includes("i") || 
                            answerPrune.toLowerCase().includes("v") || 
                            answerPrune.toLowerCase().includes("a"))) {

            var pruneDB = answerPrune.toLowerCase().includes("d");

            var allContainersData;
            if (answerPrune && (answerPrune.toLowerCase().includes("c") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log()
                console.log(`Containers to prune (`.green + `database`.brightRed + `, `.green + 'running will stop'.brightCyan + '):'.green);
                allContainersData = inspectFunc.getAllContainersData();
                if (!pruneDB) {
                    allContainersData = allContainersData.filter(container => container.DockerizeService != "gr-db");
                }
                utilsArray.orderByColumn(allContainersData, "ContainerName");
                allContainersData.forEach(container => {
                    if (container.DockerizeService && container.DockerizeService.endsWith('gr-db')) {
                        console.log(`  ${container.ContainerName}`.brightRed);
                    } else if (container.Status && container.Status != "exited") {
                        console.log(`  ${container.ContainerName}`.brightCyan);
                    } else {
                        console.log(`  ${container.ContainerName}`);
                    }
                });
            }
            if (answerPrune && (answerPrune.toLowerCase().includes("i") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log()
                console.log("Images to prune (".green + "database".brightRed + "):".green)
                var allImagesData = inspectFunc.getAllImagesData();
                if (!pruneDB) {
                    allImagesData = allImagesData.filter(image => image.DockerizeService != "gr-db");
                }
                utilsArray.orderByColumn(allImagesData, "ImageName", false, "ImageId");
                allImagesData.forEach(image => {
                    if (image.DockerizeService && image.DockerizeService.endsWith('gr-db')) {
                        console.log(`  ${(image.ImageName == "" ? image.ImageId : image.ImageName)}`.brightRed);
                    } else {
                        console.log(`  ${(image.ImageName == "" ? image.ImageId : image.ImageName)}`);
                    }
                });
            }
            if (answerPrune && (answerPrune.toLowerCase().includes("v") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log()
                console.log(`All volumes not used by at least one container will be pruned.`.green)
            }

            console.log()
            var confirm = await utilsQuestion.makeQuestion(`${"WARNING!".brightRed} You want to prune all the items listed above (y/n)? `, "", true);

            if (!confirm) {
                return;
            }

            // stop container
            stopFunc.stopContainers(allContainersData.map(container => container.ContainerName));

            const filterDB = pruneDB ? "" : " --filter \"label!=com.docker.compose.service=gr-db\"";

            if (answerPrune && (answerPrune.toLowerCase().includes("c") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log(execCommand(`docker container prune -f${filterDB}`));
            }
            if (answerPrune && (answerPrune.toLowerCase().includes("i") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log(execCommand(`docker image prune -a -f${filterDB}`));
            }
            if (answerPrune && (answerPrune.toLowerCase().includes("v") || 
                                answerPrune.toLowerCase().includes("a"))) {
                console.log(execCommand(`docker volume prune -f`));
            }
        }
    } catch (exception) {
        if (exception instanceof customErrors.ExitException) {
            console.log(exception.message)
        } else {
            console.log(`${exception}`.brightRed);
        }
    }
}

function execCommand(command) {
    console.log("")
    console.log("command: ".green + command)
    return execSync(command, {stdio: 'pipe'}).toString();
}