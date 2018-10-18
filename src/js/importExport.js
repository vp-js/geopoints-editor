"use strict";

const importExport = (function() {

  function importCsv() {
    var ctx = this;
    var fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", /*".csv,.txt"*/ "text/csv");
    fileInput.onchange = function(e) {
      var reader = new FileReader();
      reader.onload = function() {
        var parsed = parseCsv(reader.result);
        var infoMsg = convertParsed(parsed, ctx.points);
        ctx.messaging(infoMsg); // TODO correct messaging
      };
      reader.readAsText(fileInput.files[0]);
    };
    fileInput.click();
  }


  function parseCsv(txtData) {
    try {
      var lines = txtData.trim().split(/[\r\n]+/);
      var props = lines.shift().split(",");
      var parsed = lines.map((line) => {
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


  function convertParsed(parsed, pointsColln) {
    // assume categories
    if (parsed[0] && parsed[0].parentId) {
      storage.saveCategories(parsed);
      return "categories parsed";
      //console.log("categories parsed");

    //assume points
    } else if (parsed[0] && parsed[0].lat) {
      var geoObjData = parsed.map(Point.toGeoObjData);
      var names = pointsColln.toArray().map(point => point.properties.get(appConfig.nameField));

      geoObjData.forEach(elem => {
        if (!names.includes(elem.properties[appConfig.nameField])) {
          pointsColln.add(new ymaps.Placemark(elem.coords, elem.properties));
        }
      });

      //storage.loadImages(); // for demo

      pointsColln.getMap().setBounds(pointsColln.getBounds());
      return "points parsed";
      //console.log("points parsed");

    } else {
      throw new Error("Incorrect csv file structure");
    }
  }


  function exportCsv() {
    var pointArr = [];
    this.points.each(elem => pointArr.push({coords: elem.geometry.getCoordinates(), properties: elem.properties.getAll()}));

    if (!pointArr.length) {
      console.log("no points");
      return;
    }

    var csvEntries = pointArr.map(Point.fromGeoObjData);
    var txtData = Object.keys(csvEntries[0]).join(",") + "\n"
      + csvEntries.map((elem) => Object.values(elem).join(",")).join("\n");

    var blob = new Blob([txtData], {type: "text/csv"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "points.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return {
    importCsv: importCsv,
    parseCsv: parseCsv,
    exportCsv: exportCsv
  };

}());
