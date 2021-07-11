module.exports = {
  
    size: function (size) {
        var result;
        if (size < 1024) {
            // B
            result = size + " B"
        } else if (size < 1048576) {
            // KB
            result = (size / 1024).toFixed(2) + " KB";
        } else if (size < 1073741824) {
            // MB
            result = (size / 1048576).toFixed(2) + " MB";
        } else {
            // GB
            result = (size / 1073741824).toFixed(2) + " GB";
        }
        return result;
    },

    separateNumbers: function (numbers) {
        let result = new Array();

        for (let i of numbers.split(",")) {
            let j = i.split("-");
            if (j.length == 1) {
                result.push(j);
            } else if (j.length == 2) {
                if (parseInt(j[0]) <= parseInt(j[1])) {
                    for (let n = parseInt(j[0]); n <= parseInt(j[1]); n++) {
                        result.push(n);
                    }
                } else {
                    for (let n = parseInt(j[1]); n <= parseInt(j[0]); n++) {
                        result.push(n);
                    }
                }
            } else {
                console.log(`ERROR in function separateNumbers. The parameter ${numbers} does not have the proper format: for example 15,4,6-9`);
                return undefined;
            }
        }

        return result;
    }
  
};