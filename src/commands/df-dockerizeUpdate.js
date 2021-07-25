#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[9];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function dockerize update")
  .option("-ou, --onlyUpdate", "does not check if the installed version is lower than the latest and does not create a workspace", false)
  .action((package, options) => {
    require("./dockerizeUpdate")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Check the installed version and the latest available version of the @goldenrace/dockerize package.
  If the installed version is less than the latest available, 
  it gives the option to update the version and create a dockerize workspace from the installed version.
    `);
  });

program.parse(process.argv);

