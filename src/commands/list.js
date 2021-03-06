#! /usr/bin/env node
const listFunc = require('../functions/listFunc');
const utilsLog = require('../utils/utilsLog');

module.exports = (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: LIST", true, true, 100);

    const mensage = o.all ? "LISTADO all" : "LISTADO normal";
    //console.log(mensage);

    try {
        listFunc.containersTableRender();
        listFunc.imagesTableRender();
    } catch (exception) {
        console.log(`${exception}`.brightRed);
    }

}
