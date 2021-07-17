#! /usr/bin/env node
require('colors');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const stopFunc = require('../functions/stopFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: STOP", true, true, 100);

    const mensage = o.all ? "STOP all" : "STOP normal";
    //console.log(mensage);

    var containerData = listFunc.containersTableRender(true);

    var answer = await utilsQuestion.makeQuestion(
        'Which containers do you want to stop (enter the numbers # separated by \",\" or \"-\" for range)? ');
    
    try {
        var containersToStop = listFunc.findNumsInTable(answer, containerData, "ContainerName");
        console.log(`Containers to stop: ${containersToStop.join(" ")}`);
        console.log("");
        containersToStop.forEach(container => stopFunc.stopContainer(container));
    } catch (exception) {
        console.log(exception.toString().red);
    }
}
