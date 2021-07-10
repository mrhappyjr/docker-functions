#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[0];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function list")
  .option("-a, --all", "more lists", false)
  .action((package, options) => {
    require("./list")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  List information about containers and images.
    `);
  });

program.parse(process.argv);

