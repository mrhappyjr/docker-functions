#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[2];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function commit")
  .action((package, options) => {
    require("./commit")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Create a local image from a container.
  If an image of an existing version is committed, the old image is overwritten.
    `);
  });

program.parse(process.argv);

