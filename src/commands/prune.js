#! /usr/bin/env node
require('colors');
const customErrors = require('../errors/customErrors');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const pruneFunc = require('../functions/pruneFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: PRUNE", true, true, 100);

    const mensage = o.all ? "PRUNE all" : "PRUNE normal";
    //console.log(mensage);

    try {
        var containersData = listFunc.containersTableRender(true);
        var imagesData = listFunc.imagesTableRender(true, containersData.length + 1);

        console.log(`Enter \"a\" (select all) or numbers (column #) separated by \",\" or \"-\" (range).`.bgBlue);
        var answer = await utilsQuestion.makeQuestion(
            `Which containers and images do you want to prune? `);
    
        if (answer && answer.toLowerCase() == "a" || answer.toLowerCase() == "all") {
            answer = `1-${containersData.length + imagesData.length}`;
        }

        var existContainers = true;
        var existImages = true;
        try {
            var containersToPrune = listFunc.findNumsInTable(answer, containersData, "ContainerName");
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                existContainers = false;
            } else {
                throw exception;
            }
        }
        try {
            var imagessToPrune = listFunc.findNumsInTable(answer, imagesData, "ImageName");
        } catch (exception) {
            if (exception instanceof customErrors.NotFoundError) {
                existImages = false;
            } else {
                throw exception;
            }
        }
        console.log(`Containers to prune:\n  ${containersToPrune ? containersToPrune.join("\n  ") : ""}`);
        console.log("");
        console.log(`Images to prune:\n  ${imagessToPrune ? imagessToPrune.join("\n  ") : ""}`);
        console.log("");

        containersToPrune.forEach(container => pruneFunc.pruneContainer(container));
    } catch (exception) {
        console.log(`${exception}`.brightRed);
    }
}
