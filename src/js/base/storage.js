"use strict"

const storage = function(storage = {}) {
  var currentStorage, _config;

  storage.init = function(config) {
    _config = config;
    if (_config.appMode == "localdev") {
      currentStorage = localStorage;
    } else {
      currentStorage = sessionStorage;
    }
  }

  var loadedCategories;
  storage.getCategories = function() {
    return loadedCategories || (loadedCategories = JSON.parse(currentStorage.getItem("ymapsPointCategories")) || []);
  }
  storage.saveCategories = function(categories) {
    currentStorage.setItem("ymapsPointCategories", JSON.stringify(categories));
  }

  var loadedPoints;
  storage.getPoints = function() {
    if (!loadedPoints) {
      var pointData = JSON.parse(currentStorage.getItem("ymapsPoints")) || [];
      loadedPoints = pointData.map(Point.create);
    }
    return loadedPoints;
  }
  storage.savePoints = function(points) {
    currentStorage.setItem("ymapsPoints", JSON.stringify(points));
  }

  storage.getImage = (pointName) => currentStorage.getItem(_config.imagesConfig.imgStoragePrefix + pointName);
  storage.saveImage = (pointName, imgSrc) => currentStorage.setItem(_config.imagesConfig.imgStoragePrefix + pointName, imgSrc);

  return storage;
}();
