require('colors');
const readline = require('readline');

var answer;

var rl;

const question = (txt, defaultAnswer) => {
  return new Promise((resolve, reject) => {
    rl.question(txt.bgBlue, (answerLocal) => {
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
    iniReadLine();
    await question(txt, defaultAnswer)
    rl.close()
    if (yes_no && yes_no == true) {
      if (answer.toLowerCase() == "y" || answer.toLowerCase() == "yes") {
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
