#! /usr/bin/env node

const { program, Option } = require("commander");
const package = require("../package.json");
const command = Object.keys(package.bin)[0];

const app = program
  .name(command)
  .version(package.version)
  .description(package.description)
  .on("--help", () => {
    console.log(`
\n
---------------------------------------------------------------------------------------------------------
Help:
  Shows the list of containers (Name, Id, Status, Pid, ​​ImageSource) and images (Name, Id, ParentImageId).

Examples:
`);
  });
