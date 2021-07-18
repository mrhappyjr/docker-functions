#! /usr/bin/env node
require('colors');
const customErrors = require('../errors/customErrors');
const utilsQuestion = require('../utils/utilsQuestion');
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
        var answer = await utilsQuestion.makeQuestion(`Enter \"a\" (select all) or numbers (column #) separated by \",\" or \"-\" (range).` +
            `\nWhich containers and images do you want to remove? `);
    
        if (answer && answer.toLowerCase() == "a" || answer.toLowerCase() == "all") {
            answer = `1-${containersData.length + imagesData.length}`;
        }

        var existContainers = true;
        var existImages = true;
        try {
            var containersToRemove = listFunc.findNumsInTable(answer, containersData, "ContainerName");
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                existContainers = false;
            } else {
                throw exception;
            }
        }
        try {
            var imagessToRemove = listFunc.findNumsInTable(answer, imagesData, "ImageName");
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                existImages = false;
            } else {
                throw exception;
            }
        }
        if (containersToRemove && containersToRemove.length > 0) {
            console.log(`Containers to remove:\n  ${containersToRemove.join("\n  ")}`);
        }
        if (imagessToRemove && imagessToRemove.length > 0) {
            console.log(`Images to remove:\n  ${imagessToRemove.join("\n  ")}`);
        }

        for (const container of containersToRemove) {
            console.log("");
            await removeFunc.removeContainer(container);
        }
    } catch (exception) {
        console.log(`${exception}`.brightRed);
    }
}
