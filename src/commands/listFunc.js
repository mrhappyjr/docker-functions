#! /usr/bin/env node
const child_process = require('child_process');
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');
const utilsNumber = require('../utils/utilsNumber');
const utilsDate = require('../utils/utilsDate');
const table = require('tty-table');

module.exports = {

    containersTableData: function () {
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

        return containerData;
    },

    dbContainerCellColor: function (cellValue, columnIndex, rowIndex, rowData, inputData) {
        const row = inputData[rowIndex] // get the whole row
        
        if (row.DockerizeService.endsWith(' => gr-db')) {
            return this.style(cellValue, "green");
        } else {
            return this.style(cellValue);
        }
    },

    containersTableHeader: function () {
        const header = [
            {
                value: "ContainerName",
                formatter: this.dbContainerCellColor
            },
            {
                value: "ContainerId",
                formatter: this.dbContainerCellColor
            },
            {
                value: "Created",
                formatter: this.dbContainerCellColor
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
                formatter: this.dbContainerCellColor
            },
            {
                value: "DockerizeService",
                formatter: this.dbContainerCellColor
            },
            {
                value: "MySQLversion",
                formatter: this.dbContainerCellColor
            },
            {
                value: "MySQLpass",
                formatter: this.dbContainerCellColor
            }
        ];

        return header;
    },

    containersTableOptions: function () {
        const options = {
            headerColor: "cyanBright",
            align: "left",
            width: "100%"
        };

        return options;
    },

    containersTableRender: function (data, header, options) {
        console.log(table(header, data, options).render());
    },

    imagesTable: function () {
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

}

function getData(command) {
    var ids = child_process.execSync(command).toString();
    ids = utilsString.replaceEOL(ids, " ");

    return JSON.parse(child_process.execSync(`docker inspect ${ids}`, {maxBuffer: 10485760}).toString());
}

function dbImageCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.MySQLversion && row.MySQLversion != "") {
        return this.style(cellValue, "green");
    } else {
        return this.style(cellValue);
    }
}
