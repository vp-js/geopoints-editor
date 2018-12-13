"use strict"

const ymapsProvider = function() {
  var map, pointsColln, newPointsColln, currentPoint;
  var mapConfig, pointsConfig, idField, extCallbacks = {};

  function init(config) {
    mapConfig = config.mapConfig;
    pointsConfig = config.pointsConfig;
    idField = config.idField;
  }

  function createMap() {
    map = new ymaps.Map("ymsMap", {
      center: mapConfig.mapCenter,
      zoom: mapConfig.mapZoom,
      controls: ["zoomControl", "rulerControl"]
    }, {
      autoFitToViewport: mapConfig.autoFitToViewport,
      suppressMapOpenBlock: mapConfig.suppressMapOpenBlock
    });

    pointsColln = new ymaps.GeoObjectCollection({}, {
      preset: pointsConfig.defaultPreset,
      draggable: false
    });
    map.geoObjects.add(pointsColln);

    newPointsColln = new ymaps.GeoObjectCollection({}, {
      iconColor: pointsConfig.color.CREATE,
      draggable: true
    });
    map.geoObjects.add(newPointsColln);

    window.addEventListener("resize", handleResize);
    handleResize();

    function handleResize() {
      var sz = map.behaviors.get("scrollZoom");
      var mapContainerElem = map.container.getParentElement();
      var sizeVal = mapConfig.smallSizeBreakpoint
      if (mapContainerElem.offsetHeight > sizeVal && !sz.isEnabled()) sz.enable();
      else if (mapContainerElem.offsetHeight <= sizeVal && sz.isEnabled()) sz.disable();
    }
  }

  function addPoints(points) {
    var presentPointsIds = pointsColln.toArray().map(point => point.properties.get(idField));
    points.forEach(point => {
      if (!presentPointsIds.includes(point.getId())) {
        var geoObjData = toGeoObjData(point);
        pointsColln.add(new ymaps.Placemark(geoObjData.coords, geoObjData.properties));
      }
    });
    //map.setBounds(pointsColln.getBounds());
  }

  function getPoints() {
    return pointsColln.toArray().map(toPoint);
  }

  function setCreate(bEnable) {
    if (bEnable) {
      map.events.add("click", createMapPoint)
    } else {
      newPointsColln.removeAll();
      map.events.remove("click", createMapPoint);
    }
  }
  function setEdit(bEnable) {
    if (bEnable) {
      pointsColln.events.add("click", editMapPoint)
    } else {
      clearCurrentPoint();
      pointsColln.events.remove("click", editMapPoint);
    }
  }


  function createMapPoint(e) {
    if (currentPoint) {
      currentPoint.geometry.setCoordinates(e.get("coords"));
    } else {
      currentPoint = new ymaps.Placemark(e.get("coords"));
      newPointsColln.add(currentPoint);
    }
  }

  function editMapPoint(e) {
    if (currentPoint != e.get("target")) {
      clearCurrentPoint();
      currentPoint = e.get("target");
      currentPoint.options.set("draggable", true);
      currentPoint.options.set("iconColor", pointsConfig.color.EDIT);

      extCallbacks.onPointEdit();
    }
  }

  function getCurrentPoint() {
    return currentPoint && toPoint(currentPoint);
  }
  function saveCurrentPoint(point) {
    if (currentPoint) {
      currentPoint.properties.setAll(toGeoObjData(point).properties);
      pointsColln.add(currentPoint);
      clearCurrentPoint();
    }
  }
  function removeCurrentPoint() {
    if (currentPoint) {
      currentPoint.setParent(null);
      currentPoint = null;
    }
  }
  function clearCurrentPoint() {
    if (currentPoint) {
      currentPoint.options.set("draggable", null);
      currentPoint.options.set("iconColor", undefined);
      currentPoint = null;
    }
  }

  function toGeoObjData(point) {
    var result = {
      coords: [+point.lat, +point.long],
      properties: {
        category: point.category,
        name: point.name,
        description: point.description,
        town: point.town,
        address: point.address,
        phone: point.phone,
        website: point.website,
        mail: point.mail,
        openingTime: point.openingTime,

        // sync geo obj props
        iconContent: point.name
      }
    }
    return result;
  }

  function toPoint(mapPoint) {
    var [lat, long] = mapPoint.geometry.getCoordinates();
    return Point.create(Object.assign({lat, long}, mapPoint.properties.getAll()));
  }

  // TODO other ways
  function initExtCallbacks(extCbs) {
    extCallbacks.onPointEdit = extCbs.onPointEdit;
  }


  function initControls(handlers) {
    var buttons = createControls(map);

    buttons.createPointButton.events.add("select", () => {buttons.editPointButton.deselect(); handlers.createOn();});
    buttons.createPointButton.events.add("deselect", handlers.createOff);
    buttons.editPointButton.events.add("select", () => {buttons.createPointButton.deselect(); handlers.editOn();});
    buttons.editPointButton.events.add("deselect", handlers.editOff);

    buttons.importButton.events.add("click", importExport.importCsv.bind(null, addPoints));
    buttons.exportButton.events.add("click", () => importExport.exportCsv(getPoints()));
  }

  return {
    createMap,
    getPoints,
    addPoints,
    getCurrentPoint,
    saveCurrentPoint,
    removeCurrentPoint,
    setCreate,
    setEdit,
    initControls,
    initExtCallbacks,
    init
  }
}();


// temp helper func
function createControls(map) {
  var createPointButton = new ymaps.control.Button({
    data: {
      image: "images/buttons/add_icon.jpg",
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
      title: "Export points to csv"
    },
    options: {
      selectOnClick: false,
      float: "right",
      position: {right: "10px", top: "46px"}
    }
  });

  map.controls.add(createPointButton).add(editPointButton).add(importButton).add(exportButton);

  return {
    createPointButton,
    editPointButton,
    importButton,
    exportButton
  }
}