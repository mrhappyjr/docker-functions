module.exports = {
  
  logHeader: function (txt, iniLine, endLine, length) {
    if (iniLine && iniLine == true) {
      console.log(" ");
    }

    if (!length || length == 0 || length > process.stdout.columns) {
      length = process.stdout.columns;
    }

    const charLine = "-";
    var line = "";
    for (let i = 0; i < length; i++) {
      line = line + charLine;
    }
    console.log(line);

    const numCharExtra = (length - txt.length - 3) / 2;
    if (numCharExtra < 0) {
      console.log(txt);
    } else {
      let charExtra = "#";
      let extraIni = "";
      let extraEnd = "";
      for (let i = 0; i < numCharExtra; i++) {
        extraIni = extraIni + charExtra;
      }
      for (let i = 0; i < (length - extraIni.length - txt.length - 2); i++) {
        extraEnd = extraEnd + charExtra;
      }
      console.log(extraIni + " " + txt + " " + extraEnd);
    }

    console.log(line);

    if (endLine && endLine == true) {
      console.log(" ");
    }
  }

};