#! /usr/bin/env node
const { program, Option } = require("commander");
const package = require("../../package.json");
const command = Object.keys(package.bin)[0];

const app = program
  .name(command)
  .version(package.version)
  .description(package.description)
  .option("-a, --all", "more lists", false)
  .action((package, options) => {
    require("./list")(package, program.opts());
  })
  .on("--help", () => {
    console.log(`
\n
-------------------------------------------------------------------------------------------  
Help:
  Follow these steps to integrate ${command} into the CI workflow.
  1. Install ${command} on your project:
    $ npm i --save-dev ${package.name}
  2. Create a folder "docker-env" with the environment config files needed by your project. 
  3. Add a "docker-build" script to your "package.json":
    dockerize build \${npm_package_name}@\${npm_package_version} -e ./docker-env
  4. Add a "docker-publish" script to your package.json:
    dockerize publish \${npm_package_name}@\${npm_package_version}
  5. Add the previous commands to the "ci.yml" file as a new stage:
    Docker:
      - npm run docker-build
      - npm run docker-publish
    `);
  });

// -----------------------------------------------------------------------------------------------------------
program.parse(process.argv);

