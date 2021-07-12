#! /usr/bin/env node
const child_process = require('child_process');
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');
const utilsNumber = require('../utils/utilsNumber');
const utilsDate = require('../utils/utilsDate');
const utilsLog = require('../utils/utilsLog');
const table = require('tty-table');

module.exports = (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: LIST", true, true, 100);

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

    const header = [
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
}

function imagesTable() {
    var imageData = getData('docker image ls -aq');

    imageData = imageData.map(element => {
        const newElement = {};
        newElement.ImageName = element.RepoTags;
        newElement.ImageId = element.Id.substring(7, 19);
        newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
        newElement.ImageParent = element.Parent.substring(7, 19);
        if (element.Config && element.Config.Env) {
            newElement.MySQLversion = utilsArray.value(element.Config.Env, "MYSQL_VERSION=");
            newElement.MySQLpass = utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=");
        }
        newElement.Size = utilsNumber.size(element.Size);

        return newElement;
    });

    utilsArray.orderByColumn(imageData, "ImageName");

    const header = [
        {
            value: "ImageName",
            formatter: dbImageCellColor
        },
        {
            value: "ImageId",
            formatter: dbImageCellColor
        },
        {
            value: "Created",
            formatter: dbImageCellColor
        },
        {
            value: "ImageParent"
        },
        {
            value: "MySQLversion",
            formatter: dbImageCellColor
        },
        {
            value: "MySQLpass",
            formatter: dbImageCellColor
        },
        {
            value: "Size",
            formatter: dbImageCellColor
        }
    ];

    const options = {
        headerColor: "cyanBright",
        align: "left",
        width: "100%"
    };

    console.log(table(header, imageData, options).render());
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

function dbImageCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.MySQLversion && row.MySQLversion != "") {
        return this.style(cellValue, "green");
    } else {
        return this.style(cellValue);
    }
}