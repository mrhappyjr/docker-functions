#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');
const utilsNumber = require('../utils/utilsNumber');
const utilsDate = require('../utils/utilsDate');
const inspectFunc = require('./inspectFunc');
const table = require('tty-table');

module.exports = {

    containersTableData: function (hasColumnNumer) {
        var containerData = inspectFunc.getContainersData(getIds('docker ps -aq'));

        containerData = containerData.map(element => {
            const newElement = {};
            newElement.ContainerName = element.ContainerName.substring(1);
            newElement.ContainerId = element.ContainerId;
            newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
            if (element.Status == "exited") {
                newElement.Status = "Exited (" + element.ExitCode + ") " + utilsDate.dateAgo(element.FinishedAt) + ' ago';
            } else {
                newElement.Status = "Up " + utilsDate.dateAgo(element.StartedAt);
                if (element.Health) {
                    newElement.Status = newElement.Status + " (" + element.Health + ") ";
                }
            }
            newElement.ImageSource = element.ImageSource;
            newElement.DockerizeService = element.DockerizeWorkingDir 
                // + '/' 
                // + element.DockerizeConfigFile
                + ' => ' 
                + element.DockerizeService;
            newElement.MySQLversion = element.MySQLversion;
            newElement.MySQLpass = element.MySQLpass;

            return newElement;
        });

        utilsArray.orderByColumn(containerData, "ContainerName");

        if (hasColumnNumer) {
            utilsArray.insertNumbersObject(containerData, "#");
        }

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

    containersTableHeader: function (hasColumnNumer) {
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

        if (hasColumnNumer) {
            var columnNumbers =  {
                value: "#",
                formatter: this.dbContainerCellColor
            };
            header.unshift(columnNumbers);
        }

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
    },

    createCommandParam: function (txt, tableData) {
        var numbersToStop = utilsNumber.separateNumbers(txt);
        numbersToStop = numbersToStop.map(element => {
            var foundElement = tableData.find(obj => {
                return obj["#"] == element;
            });
            if (foundElement) {
                return foundElement.ContainerId;
            }
        });
    
        numbersToStop = numbersToStop.join(" ");
    
        if (utilsString.replaceAll(numbersToStop, " ", "") == "") {
            throw `ERROR: No elements found with \'${txt}\' response`.red;
        }
    
        return numbersToStop;
    }

}

function getData(command) {
    var ids = execSync(command).toString();
    ids = utilsString.replaceEOL(ids, " ");

    return JSON.parse(execSync(`docker inspect ${ids}`, {maxBuffer: 10485760}).toString());
}

/**
 * From a command, the function returns a list of ids separated by " "
 * 
 * @param {String} command command to get a list of ids
 * 
 * @return {String} list of ids separated by " "
 */
function getIds(command) {
    var ids = execSync(command).toString();
    return utilsString.replaceEOL(ids, " ");
}

function dbImageCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.MySQLversion && row.MySQLversion != "") {
        return this.style(cellValue, "green");
    } else {
        return this.style(cellValue);
    }
}
