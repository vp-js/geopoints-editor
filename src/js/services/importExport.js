"use strict";

const importExport = (function() {
  var infoBlock;

  function init(infoBlock_) {
    infoBlock = infoBlock_;
  }

  function importCsv(onComplete) {
    var fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", /*".csv,.txt"*/ "text/csv"); //TODO ext or mediatype
    fileInput.onchange = function(e) {
      var reader = new FileReader();
      reader.onload = function() {
        var parsed = parseCsv(reader.result);
        convertParsed(parsed, onComplete);
      };
      reader.readAsText(fileInput.files[0]);
    };
    fileInput.click();
  }


  function parseCsv(txtData) {
    try {
      var lines = txtData.trim().split(/[\r\n]+/);
      var props = lines.shift().split(",");
      var parsed = lines.map(line => {
        var resultObj = {};
        var values = line.split(",");
        for (var i = 0; i < props.length; i++) {
          resultObj[props[i]] = values[i];
        }
        return resultObj;
      });
      return parsed;
    } catch (e) {
      throw new Error("Incorrect csv file");
    }
  }


  // TEMP dev
  function convertParsed(parsed, onComplete) {
    if (parsed[0] && parsed[0].parentId) {
      storage.saveCategories(parsed); // assume categories
      //console.log("categories parsed");
      infoBlock.showInfo("Categories parsed");
    } else if (parsed[0] && parsed[0].lat) {
      onComplete(parsed.map(Point.create)); //assume points
      infoBlock.showInfo("Points parsed");
    } else {
      infoBlock.showError("Incorrect csv file structure");
      //throw new Error("Incorrect csv file structure");
    }
  }


  function exportCsv(dataArr) {
    if (!dataArr || !dataArr.length) {
      var txtData = "";
    } else {
      txtData = Object.keys(dataArr[0]).join(",") + "\n"
        + dataArr.map((elem) => Object.values(elem).join(",")).join("\n");
    }

    var blob = new Blob([txtData], {type: "text/csv"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "points.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  return {
    init: init,
    importCsv: importCsv,
    parseCsv: parseCsv,
    exportCsv: exportCsv
  };

}());
