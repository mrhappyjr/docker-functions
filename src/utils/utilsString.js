module.exports = {
  
  replaceAll: function (txt, search, replace) {
    while (txt.includes(search)) {
      txt = txt.replace(search, replace);
    }
    return txt;
  },

  replaceEOL: function (txt, replace) {
    var result = this.replaceAll(txt, '\n', replace);
    result = this.replaceAll(result, '\r', replace);
    return result;
  },

  toArray: function (txt, splitLine, splitElement) {
    var resultArray = [];
    const linesArray = txt.split(splitLine);
    linesArray.forEach(element => {
      if (element != '') {
        if (splitElement) {
          resultArray.push(element.split(splitElement));
        } else {
          resultArray.push(element);
        }
      }
    });
    return resultArray;
  }

};