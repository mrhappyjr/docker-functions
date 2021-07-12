#! /usr/bin/env node
const listFunc = require('./listFunc');
const utilsLog = require('../utils/utilsLog');

module.exports = (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: LIST", true, true, 100);

    const mensage = o.all ? "LISTADO all" : "LISTADO normal";
    //console.log(mensage);

    console.log('Loading containers and images ...');

    listFunc.containersTableRender(listFunc.containersTableData(), listFunc.containersTableHeader(), listFunc.containersTableOptions());
    listFunc.imagesTable();
}
