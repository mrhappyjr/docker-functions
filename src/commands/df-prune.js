#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[3];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function prune")
  .option("-a, --all", "prune all containers and images", false)
  .action((package, options) => {
    require("./prune")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Prune containers and images.
    `);
  });

program.parse(process.argv);

