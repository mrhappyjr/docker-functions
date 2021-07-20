#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[4];

const app = program
  .name(command)
  .version(package.version)
  .description("Docker function save")
  .action((package, options) => {
    require("./save")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
-----------------------------------------------
Help:
  Save a docker image to a compressed file in a local path.
    `);
  });

program.parse(process.argv);

