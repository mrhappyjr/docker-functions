#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[1];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function stop")
  .option("-a, --all", "stop all containers", false)
  .action((package, options) => {
    require("./stop")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Stop containers.
    `);
  });

program.parse(process.argv);

