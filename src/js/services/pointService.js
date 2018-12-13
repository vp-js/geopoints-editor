"use strict"

const pointService = function() {

  function getAll() {
    return storage.getPoints();
  }
  function saveAll(points) {
    storage.savePoints(points);
  }

  function getPointImage(pointName) {
    return storage.getImage(pointName);
  }
  function savePointImage(pointName, imgSrc) {
    storage.saveImage(pointName, imgSrc);
  }

  return {
    getAll: getAll,
    saveAll: saveAll,
    getPointImage: getPointImage,
    savePointImage: savePointImage
  }

}();