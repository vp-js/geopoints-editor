"use strict"

const storage = {};

(function(config) {

  var currentStorage;
  if (config.appMode == "localdev") {
    currentStorage = localStorage;
  } else {
    currentStorage = sessionStorage;
    if (!sessionStorage.getItem("demoDataLoaded")) loadDemoData();
    sessionStorage.setItem("demoDataLoaded", "true");
  }

  function loadDemoData() {
    fetch("data/ymaps_spravochnik_categories.csv", {mode: "no-cors", headers: {"Content-Type": "text/csv"}})
      .then(response => response.text())
      .then(txtData => importExport.parseCsv(txtData))
      .then(parsed => storage.saveCategories(parsed))
      .catch(demoLog);
    fetch("data/ymaps_spravochnik_points.csv", {mode: "no-cors", headers: {"Content-Type": "text/csv"}})
      .then(response => response.text())
      .then(txtData => importExport.parseCsv(txtData))
      .then(parsed => storage.savePoints(parsed))
      .catch(demoLog);
    loadImages();
  }
  function loadImages() {
    fetch("data/demo_images.json")
      .then(response => response.text())
      .then(JSON.parse)
      .then(imgs => { for (var img in imgs) {currentStorage.setItem(img, imgs[img]);}})
      .catch(demoLog);
  }
  function demoLog(e) {
    console.log(e);
    alert("Error loading demo data");
  }

    /*if (imgNames) {
      imgNames.forEach(imgName => loadImage(imgName));
    } else {
      fetch("data/ymaps_spravochnik_points.csv", {headers: {"Content-Type": "text/csv"}})
        .then(response => importExport.parseCsv(response.text()))
        .then(parsed => parsed.map(point => point[config.nameField]))
        .then(imgNames => imgNames.forEach(imgName => loadImage(imgName)))
        .catch(e => alert("Error loading demo data"));
    }*/

    /*
      .then(imgNames => Promise.all(imgNames.map(imgName => fetch(config.imgStoragePrefix+imgName))))
      .then(responses => responses.map(response => URL.createObjectURL(response.blob())))
      .then(urls => urls.forEach(url => currentStorage.saveImage(, "data:image/jpg;base64,"+url)))
      .catch(e => alert("Error loading demo data"));
      */

  /*function loadImage(imgName) {
    var ext = ".jpg"; //for demo
    fetch(config.demoImgFolder + imgName + ext)
      .then(response => URL.createObjectURL(response.blob()))
      .then(url => currentStorage.saveImage(imgName,  "data:image/jpg;base64," + url))
      .catch(e => alert("Error loading images"));
  }
  this.loadImages = loadImages; // TODO refactor image loading
*/


  var loadedCategories;
  this.getCategories = function() {
    return loadedCategories || (loadedCategories = JSON.parse(currentStorage.getItem("ymapsPointCategories") || "[]"));
  }
  this.saveCategories = function(categories) {
    currentStorage.setItem("ymapsPointCategories", JSON.stringify(categories));
  }

  var loadedPoints, loadedGeoObjData;
  this.getPoints = function(bAsGeoObjData) {
    if (!loadedPoints) {
      var rawData = JSON.parse(currentStorage.getItem("ymapsPoints") || "[]");
      loadedPoints = rawData.map(Point.create);
    }
    if (!loadedGeoObjData) {
      loadedGeoObjData = loadedPoints.map(Point.toGeoObjData);
    }
    return bAsGeoObjData ? loadedGeoObjData : loadedPoints;
    //return loadedPoints;
  }

  this.savePoints = function(points, bFromGeoObjData) {
    if (bFromGeoObjData) {
      points = points.map(Point.fromGeoObjData);
    }
    currentStorage.setItem("ymapsPoints", JSON.stringify(points));
  }

  this.getImage = (pointName) => currentStorage.getItem(config.imgStoragePrefix + pointName);
  this.saveImage = (pointName, imgSrc) => currentStorage.setItem(config.imgStoragePrefix + pointName, imgSrc);

  Object.freeze(this);

}).call(storage, appConfig);
