#! /usr/bin/env node
require('colors');
const utilsLog = require('../utils/utilsLog');
const listFunc = require('../functions/listFunc');
const utilsQuestion = require('../utils/utilsQuestion');
const saveFunc = require('../functions/saveFunc');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: SAVE", true, true, 100);

    try {
        var imagesData = listFunc.imagesTableRender(true);
    
        var answer = await utilsQuestion.makeQuestion(
            'Which images do you want to save (enter the numbers # separated by \",\" or \"-\" for range)? ');
            
        var toSave = listFunc.findNumsInTable(answer, imagesData, "ImageName", "ImageId");
        var imagesToSave = toSave.map(image => image.ImageName);
        console.log(`Images to save: ${imagesToSave.join(" # ")}`);
        for (const image of toSave) {
            console.log("");
            await saveFunc.saveImage(image);
        }
    } catch (exception) {
        console.log(`${exception}`.brightRed);
    }

}
