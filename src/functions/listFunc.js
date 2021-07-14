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

    containersTableData: function (hasColumnNumber) {
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

        if (hasColumnNumber) {
            utilsArray.insertNumbersObject(containerData, "#");
        }

        return containerData;
    },

    containersTableHeader: function (hasColumnNumber) {
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

        if (hasColumnNumber) {
            var columnNumbers =  {
                value: "#",
                formatter: dbContainerCellColor
            };
            header.unshift(columnNumbers);
        }

        return header;
    },

    imagesTableData: function (hasColumnNumber) {
        //var imageData = getData('docker image ls -aq');
        var imageData = inspectFunc.getImagesData(getIds('docker image ls -aq'));

        imageData = imageData.map(element => {
            const newElement = {};
            newElement.ImageName = element.ImageName;
            newElement.ImageId = element.ImageId;
            newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
            newElement.ImageParent = element.ImageParent;
            newElement.MySQLversion = element.MySQLversion;
            newElement.MySQLpass = element.MySQLpass
            newElement.Size = utilsNumber.size(element.Size);

            return newElement;
        });

        utilsArray.orderByColumn(imageData, "ImageName");

        if (hasColumnNumber) {
            utilsArray.insertNumbersObject(imageData, "#");
        }

        return imageData;
    },

    imagesTableHeader: function (hasColumnNumber) {
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
                value: "ImageParent",
                formatter: dbImageCellColor
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

        if (hasColumnNumber) {
            var columnNumbers =  {
                value: "#",
                formatter: dbImageCellColor
            };
            header.unshift(columnNumbers);
        }

        return header;
    },

    tableOptions: function () {
        const options = {
            headerColor: "cyanBright",
            align: "left",
            width: "100%"
        };

        return options;
    },

    tableRender: function (data, header, options) {
        console.log(table(header, data, options).render());
    },

    containersTableRender: function (hasColumnNumber) {
        var tableData = this.containersTableData(hasColumnNumber);
        this.tableRender(tableData, this.containersTableHeader(hasColumnNumber), this.tableOptions());
        return tableData;
    },

    imagesTableRender: function (hasColumnNumber) {
        var tableData = this.imagesTableData(hasColumnNumber);
        this.tableRender(tableData, this.imagesTableHeader(hasColumnNumber), this.tableOptions());
        return tableData;
    },

    findNumsInTable: function (txt, tableData, columnReturn) {
        var separateNumbers = utilsNumber.separateNumbers(txt);
        var elements = separateNumbers.reduce((result, element) => {
            var foundElement = tableData.find(obj => {
                return obj["#"] == element;
            });
            if (foundElement) {
                result.push(foundElement[columnReturn]);
            }
            return result;
        }, []);
    
        if (elements.length == 0) {
            throw `ERROR: No elements found with \'${txt}\' response`.red;
        }
    
        return elements;
    }

}

/**
 * From a command, the function returns a array of ids
 * 
 * @param {String} command command to get a list of ids
 * 
 * @return {Array} of ids
 */
function getIds(command) {
    var ids = execSync(command).toString();
    return utilsString.toArray(ids, '\n');
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
