module.exports = {

  removeStart: function (array, start, columnIndex) {
    var resultArray = array.map(function(element) {
      if (element[columnIndex].startsWith(start)) {
        element[columnIndex] = element[columnIndex].substr(1);
      }
      return element;
    });
    return resultArray;
  },

  keepStart: function (array, numChar, columnIndex) {
    var resultArray = array.map(function(element) {
      element[columnIndex] = element[columnIndex].substr(0, numChar);
      return element;
    });
    return resultArray;
  },

  insertNumbersArray: function (array, columnIndex) {
    var number = 1;
    var resultArray = array.map(function(element) {
      element.splice(columnIndex, 0, number++);
      return element;
    });
    return resultArray;
  },

  insertNumbersObject: function (array, columnName, initNumber) {
    var number = initNumber ? initNumber : 1;
    var resultArray = array.map(function(element) {
      element[columnName] = number++;
      return element;
    });
    return resultArray;
  },

  orderByColumn: function (array, columnIndex, desc, secondColumnIndex) {
    var result = 0;
    array.sort(function( a, b ) {
      if (secondColumnIndex && (a[columnIndex] == b[columnIndex])) {
        if (a[secondColumnIndex] < b[secondColumnIndex]) {
          result = -1;
        } else if (a[secondColumnIndex] > b[secondColumnIndex]) {
          result = 1;
        }
      } else if (a[columnIndex] < b[columnIndex]) {
        result = -1;
      } else {
        result = 1;
      }
      if (desc) {
        result = result * (-1);
      }
      return result;
    });
  },

  value: function (array, key) {
    var value = undefined;
    array.forEach(element => {
      if (element.startsWith(key)) {
        value = element.replace(key, "");
      }
    });
    return value;
  }

};