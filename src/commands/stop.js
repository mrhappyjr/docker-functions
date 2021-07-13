#! /usr/bin/env node
const execSync = require('child_process').execSync;
const utilsQuestion = require('../utils/utilsQuestion');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: STOP", true, true, 100);

    const mensage = o.all ? "STOP all" : "STOP normal";
    //console.log(mensage);

    console.log('Loading containers ...');

    var containerData = listFunc.containersTableData(true);

    listFunc.containersTableRender(containerData, listFunc.containersTableHeader(true), listFunc.containersTableOptions());

    var answer = await utilsQuestion.questionExample(
        'Which containers do you want to stop (enter the numbers # separated by \",\" or \"-\" for range)? ');
    
    try {
        var numbersToStop = listFunc.createCommandParam(answer, containerData);
        console.log(`Containers to stop: ${numbersToStop}`);
        var stop = execSync(`docker stop ${numbersToStop}`).toString();
        console.log(stop);
    } catch (exception) {
        console.log(exception)
    }
}
