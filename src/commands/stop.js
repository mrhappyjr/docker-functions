#! /usr/bin/env node
const child_process = require('child_process');
const utilsArray = require('../utils/utilsArray');
const utilsString = require('../utils/utilsString');
const utilsNumber = require('../utils/utilsNumber');
const utilsLog = require('../utils/utilsLog');
const utilsDate = require('../utils/utilsDate');
const table = require('tty-table');
const readline = require('readline');

module.exports = (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: TOP", true, true, 100);

    const mensage = o.all ? "STOP all" : "STOP normal";
    //console.log(mensage);

    console.log('Loading containers ...');

    var containerData = containersTable();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Which containers do you want to stop? ', (answer) => {

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

        // STRING SIN COMAS .join(" ")
        
        rl.close();
    });
    
    // rl.write('DEFAULT VALUE');
}

function containersTable() {
    var containerData = getData('docker ps -aq');

    containerData = containerData.map(element => {
        const newElement = {};
        newElement.ContainerName = element.Name.substring(1);
        newElement.ContainerId = element.Config.Hostname;
        newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
        if (element.State.Status == "exited") {
            newElement.Status = "Exited (" + element.State.ExitCode + ") " + utilsDate.dateAgo(element.State.FinishedAt) + ' ago';
        } else {
            newElement.Status = "Up " + utilsDate.dateAgo(element.State.StartedAt);
            if (element.State.Health && element.State.Health.Status) {
                newElement.Status = newElement.Status + " (" + element.State.Health.Status + ") ";
            }
        }
        newElement.ImageSource = element.Config.Image;
        newElement.DockerizeService = utilsString.replaceAll(element.Config.Labels['com.docker.compose.project.working_dir'], '\\', '/') 
            // + '/' 
            // + element.Config.Labels['com.docker.compose.project.config_files'] 
            + ' => ' 
            + element.Config.Labels['com.docker.compose.service'];
        if (element.Config.Env) {
            newElement.MySQLversion = utilsArray.value(element.Config.Env, "MYSQL_VERSION=");
            newElement.MySQLpass = utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=");
        }

        return newElement;
    });

    utilsArray.orderByColumn(containerData, "ContainerName");

    utilsArray.insertNumbersObject(containerData, "#");

    const header = [
        {
            value: "#",
            formatter: dbContainerCellColor
        },
        {
            value: "ContainerName",
            formatter: dbContainerCellColor
        },
        {
            value: "ContainerId",
            formatter: dbContainerCellColor
        },
        {
            value: "Created",
            formatter: dbContainerCellColor
        },
        {
            value: "Status",
            alias: "Status (ExitCode/Health)",
            formatter: function (value) {
                if (value.startsWith("Up ")) {
                    return this.style(value, "bgGreen", "black")
                } else {
                    return this.style(value, "bgRed", "white")
                }
            }
        },
        {
            value: "ImageSource",
            formatter: dbContainerCellColor
        },
        {
            value: "DockerizeService",
            formatter: dbContainerCellColor
        },
        {
            value: "MySQLversion",
            formatter: dbContainerCellColor
        },
        {
            value: "MySQLpass",
            formatter: dbContainerCellColor
        }
    ];

    const options = {
        headerColor: "cyanBright",
        align: "left",
        width: "100%"
    };

    console.log(table(header, containerData, options).render());

    return containerData;
}

function getData(command) {
    var ids = child_process.execSync(command).toString();
    ids = utilsString.replaceEOL(ids, " ");

    return JSON.parse(child_process.execSync(`docker inspect ${ids}`, {maxBuffer: 10485760}).toString());
}

function dbContainerCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.DockerizeService.endsWith(' => gr-db')) {
        return this.style(cellValue, "green");
    } else {
        return this.style(cellValue);
    }
}
