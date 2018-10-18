"use strict"

const pointsMap = (function() {
  var pointsColln, currentPoint, pointsConfig, map, app;

  function init(_app, config) {
    app = _app;
    pointsConfig = config.pointsConfig;

    map = new ymaps.Map("ymsMap", {
        center: config.mapCenter,
        zoom: config.mapZoom,
        controls: ["zoomControl", "rulerControl"]
      }, {
        autoFitToViewport: config.autoFitToViewport,
        suppressMapOpenBlock: config.suppressMapOpenBlock
      }
    )
    map.geoObjects.options.set("iconColor", pointsConfig.color.CREATE);
    map.geoObjects.options.set("draggable", true);

    // transform data from storage to objects on map
    // TODO refactoring
    pointsColln = new ymaps.GeoObjectCollection({}, {
      draggable: false,
      preset: pointsConfig.defaultPreset
    });
    storage.getPoints(true).forEach(geoObjData => pointsColln.add(
      new ymaps.Placemark(geoObjData.coords, geoObjData.properties)
    ));
    map.geoObjects.add(pointsColln);

    // save points to storage before exit
    window.onunload = function() {
      var pointArr = pointsColln.toArray().map(point => ({
        coords: point.geometry.getCoordinates(),
        properties: point.properties.getAll()
      }));
      storage.savePoints(pointArr, true);
    }

    initMapControls(map, pointsColln);
  }


  function saveCurrentPoint() {
    if (pointsColln.indexOf(currentPoint) == -1) {
      pointsColln.add(currentPoint);
    }
    clearCurrentPoint();
  }

  function removeCurrentPoint() {
    pointsColln.remove(currentPoint);
  }

  function clearCurrentPoint(bRemove) {
    if (!currentPoint) return;
    if (bRemove) {
      map.geoObjects.remove(currentPoint);
    } else {
      currentPoint.options.set("draggable", false);
      currentPoint.options.set("iconColor", undefined); // clear current color to use parent colln color
    }
    currentPoint = null;
  }


  function toViewMode(prevState) {
    clearState(prevState);
    map.events.remove("click", createPoint);
    pointsColln.events.remove("click", editPoint);
  }
  function toCreateMode(prevState) {
    clearState(prevState);
    pointsColln.events.remove("click", editPoint);
    map.events.add("click", createPoint);
  }
  function toEditMode(prevState) {
    clearState(prevState);
    map.events.remove("click", createPoint);
    pointsColln.events.add("click", editPoint);
  }
  function clearState(prevState) {
    if (prevState == ymsApp.AppState.EDIT) {
      clearCurrentPoint();
    } else if (prevState == ymsApp.AppState.CREATE) {
      clearCurrentPoint(true);
    }
  }

  function createPoint(e) {
    if (currentPoint) {
      currentPoint.geometry.setCoordinates(e.get("coords"));
    } else {
      currentPoint = new ymaps.Placemark(e.get("coords"));
      map.geoObjects.add(currentPoint);
    }
  }

  function editPoint(e) {
    if (currentPoint != e.get("target")) {
      clearCurrentPoint();
      currentPoint = e.get("target");
      currentPoint.options.set("draggable", true);
      currentPoint.options.set("iconColor", pointsConfig.color.EDIT);

      app.displayPoint(currentPoint);
    }
  }


  function initMapControls(map, pointsColln) {
    var createPointButton = new ymaps.control.Button({
      data: {
        image: "images/buttons/add_icon.jpg",
        /*content: "C",*/
        title: "Create point by click on map"
      },
      options: {
        float: "right",
        position: {right: "46px", top: "10px"}
      }
    });
    var editPointButton = new ymaps.control.Button({
      data: {
        image: "images/buttons/edit_icon.png",
        /*content: "E",*/
        title: "In edit mode click a point to start modification"
      },
      options: {
        float: "right",
        position: {right: "10px", top: "10px"}
      }
    });
    var importButton = new ymaps.control.Button({
      data: {
        image: "images/buttons/import_icon.png",
        //content: "Import",
        title: "Import points from csv"
      },
      options: {
        selectOnClick: false,
        float: "right",
        position: {right: "46px", top: "46px"}
      }
    });
    var exportButton = new ymaps.control.Button({
      data: {
        image: "images/buttons/export_icon.png",
        //content: "Export",
        title: "Export points to csv"
      },
      options: {
        selectOnClick: false,
        float: "right",
        position: {right: "10px", top: "46px"}
      }
    });

    createPointButton.events.add("select", () => {editPointButton.deselect(); ymsApp.setState(ymsApp.AppState.CREATE);});
    createPointButton.events.add("deselect", () => ymsApp.setState(ymsApp.AppState.VIEW));
    editPointButton.events.add("select", () => {createPointButton.deselect(); ymsApp.setState(ymsApp.AppState.EDIT);});
    editPointButton.events.add("deselect", () => ymsApp.setState(ymsApp.AppState.VIEW));

    importButton.events.add("click", ymaps.util.bind(importExport.importCsv, {points: pointsColln, messaging: app.showInfo}));
    exportButton.events.add("click", ymaps.util.bind(importExport.exportCsv, {points: pointsColln, messaging: app.showInfo}));

    map.controls.add(createPointButton).add(editPointButton).add(importButton).add(exportButton);
  }


  return {
    toViewMode: toViewMode,
    toCreateMode: toCreateMode,
    toEditMode: toEditMode,

    getCurrentPoint: () => currentPoint,
    saveCurrentPoint: saveCurrentPoint,
    removeCurrentPoint: removeCurrentPoint,

    init: init
  }

}());
