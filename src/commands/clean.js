#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsQuestion = require('../utils/utilsQuestion');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const stopFunc = require('../functions/stopFunc');
const customErrors = require('../errors/customErrors');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: CLEAN", true, true, 100);

    try {
        console.log("DISK USAGE".green + " (command \"docker system df\")")
        console.log("")
        var result = execSync(`docker system df`, {stdio: 'pipe'});
        console.log(result.toString())

        console.log("ATTENTION! By pruning you can remove containers, images, and volumes that you don't want to remove.".brightRed);
        var answerClean = await utilsQuestion.makeQuestion(`Write the initials of the entities you want to prune:\n` +
            `  ${"\"c\"".green} (remove all stopped containers)\n` + 
            `  ${"\"i\"".green} (remove all images without at least one container associated to them)\n` + 
            `  ${"\"v\"".green} (remove all local volumes not used by at least one container)\n` + 
            `  ${"\"a\"".green} (remove containers, images and volumes)\n` + 
            `in any order but together. For example \"cv\", \"vic\", etc: `);

        if (answerClean && (answerClean.toLowerCase().includes("c") || 
                            answerClean.toLowerCase().includes("i") || 
                            answerClean.toLowerCase().includes("v") || 
                            answerClean.toLowerCase().includes("a"))) {
            console.log("")
            var pruneDB = await utilsQuestion.makeQuestion(`${"WARNING!".brightRed} When doing the pruning,\n` + 
                `do you want to include the containers and images database among which they will be removed? (y/n)? `, "No", true);

            console.log("")

            const noDB = pruneDB ? " (INCLUDING database ones)" : " (EXCEPT database ones)";
            const filterDB = pruneDB ? "" : " --filter \"label!=com.docker.compose.service=gr-db\"";
        
            if (answerClean && (answerClean.toLowerCase().includes("c") || 
                                answerClean.toLowerCase().includes("a"))) {
                
                var answer = await utilsQuestion.makeQuestion(`${"WARNING!".brightRed} This will remove all stopped ${"containers".green}${noDB}.\n` + 
                `Are you sure you want to continue (y/n)? `, "", true);
                if (answer) {
                    console.log(execCommand(`docker container prune -f${filterDB}`));
                } else {
                    console.log("")
                }
            }
            if (answerClean && (answerClean.toLowerCase().includes("i") || 
                                answerClean.toLowerCase().includes("a"))) {
                var answer = await utilsQuestion.makeQuestion(`${"WARNING!".brightRed} This will remove all ${"images".green}${noDB} without at least one container associated to them.\n` + 
                `Are you sure you want to continue (y/n)? `, "", true);
                if (answer) {
                    console.log(execCommand(`docker image prune -a -f${filterDB}`));
                } else {
                    console.log("")
                }
            }
            if (answerClean && (answerClean.toLowerCase().includes("v") || 
                                answerClean.toLowerCase().includes("a"))) {
                var answer = await utilsQuestion.makeQuestion(`${"WARNING!".brightRed} This will remove all ${"local volumes".green}${noDB} not used by at least one container.\n` + 
                `Are you sure you want to continue (y/n)? `, "", true);
                if (answer) {
                    console.log(execCommand(`docker volume prune -f`));
                } else {
                    console.log("")
                }
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