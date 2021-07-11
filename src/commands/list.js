#! /usr/bin/env node
const child_process = require('child_process');
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');
const utilsDate = require('../utils/utilsDate');
const table = require('tty-table');

module.exports = (p, o) => {

    const mensage = o.all ? "LISTADO all" : "LISTADO normal";

    console.log('Loading containers and images ...');

    containersTable();
    imagesTable();
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

    const header = [
        {
            value: "ContainerName",
            formatter: dbCellColor
        },
        {
            value: "ContainerId",
            formatter: dbCellColor
        },
        {
            value: "Created",
            formatter: dbCellColor
        },
        {
            value: "Status",
            alias: "Status (ExitCode)",
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
            formatter: dbCellColor
        },
        {
            value: "DockerizeService",
            formatter: dbCellColor
        },
        {
            value: "MySQLversion",
            formatter: dbCellColor
        },
        {
            value: "MySQLpass",
            formatter: dbCellColor
        }
    ];

    const options = {
        headerColor: "cyanBright",
        align: "left",
        width: "100%"
    };

    console.log(table(header, containerData, options).render());
}

function imagesTable() {
    var imageData = getData('docker image ls -aq');

    const options = {
        headerColor: "cyan",
        align: "left",
        width: "100%"
    };
}

function getData(command) {
    var ids = child_process.execSync(command).toString();
    ids = utilsString.replaceEOL(ids, " ");

    return JSON.parse(child_process.execSync(`docker inspect ${ids}`, {maxBuffer: 10485760}).toString());
}

function dbCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.DockerizeService.endsWith(' => gr-db')) {
        return this.style(cellValue, "green");
    } else {
        return this.style(cellValue);
    }
}
