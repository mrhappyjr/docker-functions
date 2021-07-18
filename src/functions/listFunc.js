#! /usr/bin/env node
require('colors');
const customErrors = require('../errors/customErrors');
const execSync = require('child_process').execSync;
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');
const utilsNumber = require('../utils/utilsNumber');
const utilsDate = require('../utils/utilsDate');
const inspectFunc = require('./inspectFunc');
const table = require('tty-table');

const readline = require('readline');

module.exports = {

    containersTableData: function (hasColumnNumber, initNumber) {
        var containersData = inspectFunc.getAllContainersData();

        containersData = containersData.map(element => {
            const newElement = {};
            newElement.ContainerName = element.ContainerName.substring(1);
            newElement.ContainerId = element.ContainerId;
            newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
            if (element.Status == "exited") {
                newElement.Status = `Exited (${element.ExitCode})`.white.bgRed + `\n` + `${utilsDate.dateAgo(element.FinishedAt)} ago`.white.bgRed + ` `.reset;
            } else {
                newElement.Status = `Up`;
                if (element.Health) {
                    newElement.Status += " (" + element.Health + ")";
                }
                newElement.Status = newElement.Status.black.bgGreen + `\n` + utilsDate.dateAgo(element.StartedAt).black.bgGreen + ` `.reset;
            }
            newElement.ImageSourceName = utilsString.replaceAll(element.ImageSourceName, "/", "/\n");
            newElement.ImageSourceId = element.ImageSourceId;
            newElement.DockerizeService = element.DockerizeWorkingDir + '\n' + element.DockerizeService;
            newElement.MySQLversion = "";
            if (element.MySQLversion && element.MySQLversion != "") {
                newElement.MySQLversion = element.MySQLversion
            }
            if (element.MySQLpass && element.MySQLpass != "") {
                newElement.MySQLversion += "\n" + element.MySQLpass;
            }

            return newElement;
        });

        utilsArray.orderByColumn(containersData, "ContainerName");

        if (hasColumnNumber) {
            utilsArray.insertNumbersObject(containersData, "#", initNumber);
        }

        return containersData;
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
                alias: "Status\n(ExitCode/Health)"
            },
            {
                value: "ImageSourceName",
                formatter: dbContainerCellColor
            },
            {
                value: "DockerizeService",
                alias: "DockerizePath\nDockerizeService",
                formatter: dbContainerCellColor
            },
            {
                value: "MySQLversion",
                alias: "MySQLversion\nMySQLpass",
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

    imagesTableData: function (hasColumnNumber, initNumber) {
        //var imageData = getData('docker image ls -aq');
        var imagesData = inspectFunc.getAllImagesData();

        imagesData = imagesData.map(element => {
            const newElement = {};
            newElement.ImageName = utilsString.replaceAll(element.ImageName, "/", "/\n");
            newElement.ImageId = element.ImageId;
            newElement.Created = utilsDate.dateAgo(element.Created) + ' ago';
            newElement.ImageParent = element.ImageParent;
            newElement.MySQLversion = "";
            if (element.MySQLversion && element.MySQLversion != "") {
                newElement.MySQLversion = element.MySQLversion
            }
            if (element.MySQLpass && element.MySQLpass != "") {
                newElement.MySQLversion += "\n" + element.MySQLpass;
            }
            newElement.Size = utilsNumber.size(element.Size);

            return newElement;
        });

        utilsArray.orderByColumn(imagesData, "ImageName", false, "ImageId");

        if (hasColumnNumber) {
            utilsArray.insertNumbersObject(imagesData, "#", initNumber);
        }

        return imagesData;
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
                alias: "MySQLversion\nMySQLpass",
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

    containersTableRender: function (hasColumnNumber, initNumber) {
        var tableData = this.containersTableData(hasColumnNumber, initNumber);
        this.tableRender(tableData, this.containersTableHeader(hasColumnNumber), this.tableOptions());
        return tableData;
    },

    imagesTableRender: function (hasColumnNumber, initNumber) {
        var tableData = this.imagesTableData(hasColumnNumber, initNumber);
        this.tableRender(tableData, this.imagesTableHeader(hasColumnNumber), this.tableOptions());
        return tableData;
    },

    findNumsInTable: function (txt, tableData, ...columnsReturn) {
        var separateNumbers = utilsNumber.separateNumbers(txt);
        var elements = separateNumbers.reduce((result, element) => {
            var foundElement = tableData.find(obj => {
                return obj["#"] == element;
            });
            if (foundElement) {
                if (columnsReturn.length == 1) {
                    result.push(foundElement[columnsReturn[0]]);
                } else {
                    var newObject = new Object();
                    for (let i = 0; i < columnsReturn.length; i++) {
                        newObject[columnsReturn[i]] = foundElement[columnsReturn[i]]
                    }
                    result.push(newObject);
                }
            }
            return result;
        }, []);
    
        if (elements.length == 0) {
            throw new customErrors.NotFoundError(`ERROR: No elements found with \'${txt}\' response`.brightRed);
        }
    
        return elements;
    },

    imageExists: function (image) {
        try {
            var imageData = inspectFunc.getImagesData(image);
            return ((image == imageData[0].ImageName) || (image == imageData[0].ImageId) || ((image + ":latest") == imageData[0].ImageName));
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                return false;
            }
            throw exception;
        }
    },

    containerExists: function (container) {
        try {
            var containerData = inspectFunc.getContainersData(container);
            return ((utilsString.replaceAll(container, "/", "") == utilsString.replaceAll(containerData[0].ContainerName, "/", ""))
                 || (container == containerData[0].ContainerId));
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                return false;
            }
            throw exception;
        }
    },

    imageContainers: function (imageId, ...columnsReturn) {
        var filterContainers = inspectFunc.getAllContainersData().filter(container => container.ImageSourceId == imageId);

        if (columnsReturn && columnsReturn.length > 0) {
            filterContainers = filterContainers.map(container => {
                if (columnsReturn.length == 1) {
                    return container[columnsReturn[0]];
                } else {
                    var newObject = new Object();
                    for (let i = 0; i < columnsReturn.length; i++) {
                        newObject[columnsReturn[i]] = container[columnsReturn[i]]
                    }
                    return newObject;
                }
            });
        }

        return filterContainers;
    }

}

function dbContainerCellColor(cellValue, columnIndex, rowIndex, rowData, inputData) {
    const row = inputData[rowIndex] // get the whole row
    
    if (row.DockerizeService.endsWith('\ngr-db')) {
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
