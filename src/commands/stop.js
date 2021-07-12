#! /usr/bin/env node
const child_process = require('child_process');
const utilsArray = require('../utils/utilsArray');
const utilsNumber = require('../utils/utilsNumber');
const utilsLog = require('../utils/utilsLog');
const readline = require('readline');
const listFunc = require('./listFunc');

module.exports = (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: STOP", true, true, 100);

    const mensage = o.all ? "STOP all" : "STOP normal";
    //console.log(mensage);

    console.log('Loading containers ...');

    var containerData = listFunc.containersTableData();

    utilsArray.insertNumbersObject(containerData, "#");

    var containerHeader = listFunc.containersTableHeader();
    var a =  {
        value: "#",
        formatter: listFunc.dbContainerCellColor
    };
    containerHeader.unshift(a);

    listFunc.containersTableRender(containerData, containerHeader, listFunc.containersTableOptions());

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Which containers do you want to stop (enter the numbers # separated by \",\" or \"-\" for range)? ', (answer) => {

        var numbersToStop = utilsNumber.separateNumbers(answer);

        numbersToStop = numbersToStop.map(element => {
            var foundElement = containerData.find(obj => {
                return obj["#"] == element;
            });
            if (foundElement) {
                return foundElement.ContainerId;
            }
        });

        numbersToStop = numbersToStop.join(" ");

        console.log(`Containers to stop: ${numbersToStop}`);

        var stop = child_process.execSync(`docker stop ${numbersToStop}`).toString();

        console.log(stop);

        rl.close();
    });
    
    // rl.write('DEFAULT VALUE');
}
