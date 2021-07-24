#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[1];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function prune")
  .action((package, options) => {
    require("./prune")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Prune containers, images and volumes not used.
    `);
  });

program.parse(process.argv);

