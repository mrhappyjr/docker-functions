require('colors');
const readline = require('readline');
const utilsString = require('./utilsString');
const customErrors = require('../errors/customErrors');

const iniStyle = `\x1b[44m`; // bgBlue
const endStyle = `\x1b[0m`;  // reset

var answer;

var rl;

const question = (txt, defaultAnswer) => {
  return new Promise((resolve, reject) => {
    rl.question(txt, (answerLocal) => {
      answer = answerLocal
      resolve()
    });
    if (defaultAnswer) {
      rl.write(defaultAnswer);
    }
  })
}

module.exports = {

  makeQuestion: async function (txt, defaultAnswer, yes_no) {
    readline.moveCursor(process.stdout, 2, 0);
    iniReadLine();
    if (txt.includes(`\n`)) {
      txt = utilsString.replaceAll(txt, `\n`, endStyle + `\n` + iniStyle);
      //txt = utilsString.replaceAll(txt, endStyle + iniStyle, endStyle + `\n` + iniStyle);
      txt = iniStyle + txt;
      if (txt.endsWith(iniStyle)) {
        txt = txt + endStyle;
      }
      if (!txt.endsWith(endStyle)) {
        txt = txt + endStyle;
      }
    } else {
      txt = iniStyle + txt + endStyle;
    }
    await question(txt, defaultAnswer)
    rl.close()
    if (answer && (answer.toLowerCase() == "ex" || answer.toLowerCase() == "exit")) {
      throw new customErrors.ExitException(`EXIT TO MAIN MENU`);
    }
    if (yes_no && yes_no == true) {
      if (answer && (answer.toLowerCase() == "y" || answer.toLowerCase() == "yes")) {
        answer = true;
      } else {
        answer = false;
      }
    }
    return answer;
  }

}

function iniReadLine() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}
