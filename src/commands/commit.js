#! /usr/bin/env node
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const utilsQuestion = require('../utils/utilsQuestion');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: COMMIT", true, true, 100);

    console.log('Loading containers ...');

    var containerData = listFunc.containersTableData(true);

    listFunc.containersTableRender(containerData, listFunc.containersTableHeader(true), listFunc.containersTableOptions());

    var answer = await utilsQuestion.questionExample(
        'Which containers do you want to commit (enter the numbers # separated by \",\" or \"-\" for range)? ');
    
    try {
        var numbersToCommit = listFunc.createCommandParam(answer, containerData);
        console.log(`Containers to commit: ${numbersToCommit}`);
        // TODO COMMAND COMMIT var commit = execSync(`docker stop ${numbersToStop}`).toString();
        //console.log(commit);
    } catch (exception) {
        console.log(exception)
    }

}
