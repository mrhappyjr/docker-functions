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
    }
  
};