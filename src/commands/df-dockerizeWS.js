#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[8];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function dockerize workspace")
  .action((package, options) => {
    require("./dockerizeWS")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Create a dockerize workspace from the installed version of the @goldenrace/dockerize package.
    `);
  });

program.parse(process.argv);

