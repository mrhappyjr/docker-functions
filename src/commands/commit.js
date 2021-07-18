#! /usr/bin/env node
require('colors');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const utilsQuestion = require('../utils/utilsQuestion');
const commitFunc = require('../functions/commitFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: COMMIT", true, true, 100);

    try {
        listFunc.imagesTableRender();

        var containerData = listFunc.containersTableRender(true);
    
        var answer = await utilsQuestion.makeQuestion(
            'Which containers do you want to commit (enter the numbers # separated by \",\" or \"-\" for range)? ');
            
        var toCommit = listFunc.findNumsInTable(answer, containerData, "ContainerName", "ImageSource");
        var containersToCommit = toCommit.map(containerAndImage => containerAndImage.ContainerName);
        console.log(`Containers to commit: ${containersToCommit.join(" # ")}`);
        for (const containerAndImage of toCommit) {
            console.log("");
            await commitFunc.commitContainer(containerAndImage);
        }
    } catch (exception) {
        console.log(`${exception}`.brightRed);
    }

}
