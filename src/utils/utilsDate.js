module.exports = {

    dateAgo: function (date) {
      var result;

      const date_timestamp = Date.parse(date);
      const now_timestamp = (new Date).getTime();

      // date difference in seconds
      var dif = Math.trunc((now_timestamp - date_timestamp) / 1000);
      if (dif < 60) {
        // seconds
        result = dif + " second";
      } else if (dif < 3600) {
        // minutes
        dif = Math.trunc(dif / 60);
        result = dif + " minute";
      } else if (dif < 86400) {
        // hours
        dif = Math.trunc(dif / 3600);
        result = dif + " hour";
      } else if (dif < 2592000) {
        // days
        dif = Math.trunc(dif / 86400);
        result = dif + " day";
      } else {
        // months
        dif = Math.trunc(dif / 2592000);
        result = dif + " month";
      }

      if (dif > 1) {
          result = result + "s";
      }

      return result;
    }
  
  };