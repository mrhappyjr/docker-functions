const readline = require('readline');

var answer;

module.exports = {

  questionExample: async function (txt, defaultAnswer) {
    await question(txt, defaultAnswer)
    rl.close()
    return answer;
  }

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (txt, defaultAnswer) => {
  return new Promise((resolve, reject) => {
    rl.question(txt, (answerLocal) => {
      answer = answerLocal
      resolve()
    });
    rl.write(defaultAnswer);
  })
}