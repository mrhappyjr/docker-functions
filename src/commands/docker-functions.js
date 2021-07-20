#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[6];

const app = program
  .name(command)
  .version(package.version)
  .description("Print the names of the functions available in the docker-functions package")
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:` + listFunctions);
  });

const listFunctions = `  List of functions in the docker-functions package:
    df-list
    df-stop
    df-commit
    df-remove
    df-save
    df-load
    `;

program.parse(process.argv);

console.log(listFunctions)

