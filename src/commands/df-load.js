#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[5];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function load")
  .action((package, options) => {
    require("./load")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Load a docker image from a compressed file in a local path.
  Loading an image of an existing version overwrites the old image.
    `);
  });

program.parse(process.argv);

