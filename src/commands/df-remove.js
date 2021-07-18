#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[3];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function remove")
  .option("-a, --all", "remove all containers and images", false)
  .action((package, options) => {
    require("./remove")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Remove containers and images.
    `);
  });

program.parse(process.argv);

