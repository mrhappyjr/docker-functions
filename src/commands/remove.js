#! /usr/bin/env node
require('colors');
const customErrors = require('../errors/customErrors');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const removeFunc = require('../functions/removeFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: REMOVE", true, true, 100);

    const mensage = o.all ? "REMOVE all" : "REMOVE normal";
    //console.log(mensage);

    try {
        var containersData = listFunc.containersTableRender(true);
        var imagesData = listFunc.imagesTableRender(true, containersData.length + 1);

        console.log('When doing remove, if you have not committed the containers and you have not made copies of the images, you may lose important information.'.brightRed);
        console.log("");
        var answer = await utilsQuestion.makeQuestion(`Enter \"all\", \"ndb\" (NoDataBase) or numbers (column #) separated by \",\" or \"-\" (range).` +
            `\nWhich containers and images do you want to remove? `);
    
        var containersToRemove;
        var imagesToRemove;
        if (answer && answer.toLowerCase() == "all") {
            answer = await utilsQuestion.makeQuestion(`Are you sure to delete all containers and images including those from the database (y/n)? `.brightRed, "No", true);
            if (!answer) {
                return;
            }
            answer = `1-${containersData.length + imagesData.length}`;
        } else if (answer && answer.toLowerCase() == "ndb") {
            containersToRemove = listFunc.containersNoDB("ContainerName");
            imagesToRemove = listFunc.imagesNoDB("ImageName", "ImageId", "Created");
            // sort by date to remove the daughter images first
            imagesToRemove.sort((a, b) => (a.Created > b.Created) ? -1 : ((b.Created > a.Created) ? 1 : 0));
        }

        var existContainers = true;
        var existImages = true;

        if (containersToRemove === undefined) {
            try {
                containersToRemove = listFunc.findNumsInTable(answer, containersData, "ContainerName");
            } catch (exception) {
                if (exception instanceof customErrors.NotFoundError) {
                    existContainers = false;
                } else {
                    throw exception;
                }
            }
        }
        if (imagesToRemove === undefined) {
            try {
                imagesToRemove = listFunc.findNumsInTable(answer, imagesData, "ImageName", "ImageId", "CreatedDate");
                // sort by date to remove the daughter images first
                imagesToRemove.sort((a, b) => (a.CreatedDate > b.CreatedDate) ? -1 : ((b.CreatedDate > a.CreatedDate) ? 1 : 0));
                imagesToRemove = imagesToRemove.map(image => {
                    var newImage = new Object();
                    newImage.ImageName = utilsString.replaceAll(image.ImageName, "\n", "");
                    newImage.ImageId = image.ImageId;
                    return newImage;
                });
            } catch (exception) {
                if (exception instanceof customErrors.NotFoundError) {
                    existImages = false;
                } else {
                    throw exception;
                }
            }
        }
        if (existContainers == false && existImages == false) {
            console.log("")
            console.log(`No container or image was found with input \"${answer}\"`.brightRed)
            console.log("")
            return;
        }
        if (containersToRemove && containersToRemove.length > 0) {
            console.log(`Containers to remove:\n  ${containersToRemove.join("\n  ")}`);

            for (const container of containersToRemove) {
                console.log("");
                await removeFunc.removeContainer(container);
            }
        }
        if (imagesToRemove && imagesToRemove.length > 0) {
            const imagesToRemoveString = imagesToRemove.map(image => (image.ImageName && image.ImageName != "") ? image.ImageName : image.ImageId).join("\n  ");
            console.log(`Images to remove:\n  ${imagesToRemoveString}`);

            for (const image of imagesToRemove) {
                console.log("");
                await removeFunc.removeImage(image);
            }
        }
    } catch (exception) {
        console.log(`${exception}`.brightRed);
        console.log(`${exception.stack}`.brightRed);
    }
}
