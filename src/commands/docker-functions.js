#! /usr/bin/env node
require('colors');
const utilsLog = require('../utils/utilsLog');
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[6];
const utilsQuestion = require('../utils/utilsQuestion');

const app = program
  .name(command)
  .version(package.version)
  .description("Print the names of the functions available in the docker-functions package")
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:` + listFunctions);
  });

const functionsArray = ["df-list", "df-stop", "df-commit", "df-remove", "df-save", "df-load"];
const listFunctions = `  List of functions in the docker-functions package:\n    ` + functionsArray.join("\n    ");

program.parse(process.argv);

menu()

async function menu() {
  var lastFunction = "";
  do {
    if (lastFunction.toLocaleLowerCase() != "li") {
      require("./list")(package, program.opts());
    }
    utilsLog.logHeader("MENU", true, true, 17);
    var exit = false;
    console.log("  [li] " + functionsArray[0]);
    console.log("  [st] " + functionsArray[1]);
    console.log("  [co] " + functionsArray[2]);
    console.log("  [re] " + functionsArray[3]);
    console.log("  [sa] " + functionsArray[4]);
    console.log("  [lo] " + functionsArray[5]);
    console.log("");
    console.log("  [ex] EXIT");
    console.log("");

    var answer = await utilsQuestion.makeQuestion(`Enter [alias] of the function to use: `);
    lastFunction = answer;

    switch (answer.toLowerCase()) {
        case "li":
          await require("./list")(package, program.opts());
          break;
        case "st":
          await require("./stop")(package, program.opts());
          break;
        case "co":
          await require("./commit")(package, program.opts());
          break;
        case "re":
          await require("./remove")(package, program.opts());
          break;
        case "sa":
          await require("./save")(package, program.opts());
          break;
        case "lo":
          await require("./load")(package, program.opts());
          break;
        case "ex":
          exit = true;
          break;
        default:
          console.log(`Function ${answer} not found`.brightRed);
    }
  } while (!exit);

}
