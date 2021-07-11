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

  insertNumbersObject: function (array, columnName) {
    var number = 1;
    var resultArray = array.map(function(element) {
      element[columnName] = number++;
      return element;
    });
    return resultArray;
  },

  orderByColumn: function (array, columnIndex, desc) {
    var result = 0;
    array.sort(function( a, b ) {
      if (a[columnIndex] < b[columnIndex]) {
        result = -1;
      }
      if ((a[columnIndex] > b[columnIndex])) {
        result = 1;
      }
      if (desc) {
        result = result * (-1);
      }
      return result;
    });
  },

  value: function (array, key) {
    var value = "";
    array.forEach(element => {
      if (element.startsWith(key)) {
        value = element.replace(key, "");
      }
    });
    return value;
  }

};