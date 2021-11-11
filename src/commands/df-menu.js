#! /usr/bin/env node
require('colors');
const utilsLog = require('../utils/utilsLog');
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[6];
const utilsQuestion = require('../utils/utilsQuestion');
const customErrors = require('../errors/customErrors');

const app = program
  .name(command)
  .version(package.version)
  .description("Menu with all available functions")
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:` + listFunctions);
  });

const functionsArray = ["df-list", "df-stop", "df-commit", "df-remove", "df-save", "df-load", "df-prune", "df-dockerizeWS", "df-dockerizeUpdate"];
const listFunctions = `  List of functions in the docker-functions package:\n    ` + functionsArray.join("\n    ");

program.parse(process.argv);

menu()

async function menu() {
    var lastFunction = "";
    try {
        do {
            if (isList(lastFunction)) {
                require("./list")(package, program.opts());
            }
            utilsLog.logHeader("MENU", true, true, 17);
            var exit = false;
            console.log(` ${"1#".gray} ${"[li]".brightCyan} ${functionsArray[0].substring(3).green}`);
            console.log(` ${"2#".gray} ${"[st]".brightCyan} ${functionsArray[1].substring(3).green}`);
            console.log(` ${"3#".gray} ${"[co]".brightCyan} ${functionsArray[2].substring(3).green}`);
            console.log(` ${"4#".gray} ${"[re]".brightCyan} ${functionsArray[3].substring(3).green}`);
            console.log(` ${"5#".gray} ${"[sa]".brightCyan} ${functionsArray[4].substring(3).green}`);
            console.log(` ${"6#".gray} ${"[lo]".brightCyan} ${functionsArray[5].substring(3).green}`);
            console.log(` ${"7#".gray} ${"[pr]".brightCyan} ${functionsArray[6].substring(3).green}`);
            console.log(` ${"8#".gray} ${"[dw]".brightCyan} ${functionsArray[7].substring(3).green}`);
            console.log(` ${"9#".gray} ${"[du]".brightCyan} ${functionsArray[8].substring(3).green}`);
            console.log("");
            console.log(` ${"0#".gray} ${"[ex]".brightCyan} ${"EXIT MENU (answer \"ex\" to any question to return to this menu)".green}`);
            console.log("");

            var answer = await utilsQuestion.makeQuestion(`Enter ${"number #".gray}, ${"[alias]".brightCyan} or ${"name".green} of the function to use: `);
            lastFunction = answer;

            if (isList(answer)) {
                await require("./list")(package, program.opts());
            } else if (answer.toLowerCase() == "2" || answer.toLowerCase().startsWith("st")) {
                await require("./stop")(package, program.opts());
            } else if (answer.toLowerCase() == "3" || answer.toLowerCase().startsWith("co")) {
                await require("./commit")(package, program.opts());
            } else if (answer.toLowerCase() == "4" || answer.toLowerCase().startsWith("re")) {
                await require("./remove")(package, program.opts());
            } else if (answer.toLowerCase() == "5" || answer.toLowerCase().startsWith("sa")) {
                await require("./save")(package, program.opts());
            } else if (answer.toLowerCase() == "6" || answer.toLowerCase().startsWith("lo")) {
                await require("./load")(package, program.opts());
            } else if (answer.toLowerCase() == "7" || answer.toLowerCase().startsWith("pr")) {
                await require("./prune")(package, program.opts());
            } else if (answer.toLowerCase() == "8" || answer.toLowerCase() == "dw") {
                await require("./dockerizeWS")(package, program.opts());
            } else if (answer.toLowerCase() == "9" || answer.toLowerCase() == "du") {
                await require("./dockerizeUpdate")(package, program.opts());
            } else if (answer.toLowerCase() == "0" || answer.toLowerCase().startsWith("ex")) {
                exit = true;
            } else {
                console.log(`Function \"${answer}\" not found`.brightRed);
            }
        } while (!exit);
    } catch (exception) {
        if (exception instanceof customErrors.ExitException) {
            console.log("\nEXIT docker-functions\n".green)
        } else {
            console.log(`${exception}`.brightRed);
            console.log(`${exception.stack}`.brightRed);
        }
    }

}

function isList(answer) {
    return answer.toLowerCase() == "1" || answer.toLowerCase().startsWith("li");
}
