"use strict"

const mainMap = function() {
  const rootName = "root";
  var lookup, idField, containerElem;

  function init(config) {
    idField = config.idField;
    var map = new ymaps.Map("mainMap", {
      center: config.mapConfig.mapCenter,
      zoom: config.mapConfig.mapZoom
    }, {});
    map.layers.events.once("tileloadchange", () => map.container.fitToViewport());

    var rootColln = new ymaps.GeoObjectCollection({}, {
      preset: config.pointsConfig.defaultPreset,
      visible: true,
      iconImageSize: [30, 30],
      iconImageOffset: [-15, -15],
      balloonContentLayout: ymaps.templateLayoutFactory.createClass(config.balloonLayout)
    });

    lookup = {[rootName]: rootColln}; // object to facilitate collection search
    createSubCollns(categoryService.createCtgsHierarchy(true), rootColln);
    map.geoObjects.add(rootColln);

    ymaps.template.filtersStorage.add("getImage",
      (data, name, defaultValue) => pointService.getPointImage(name) || defaultValue);

    window.addEventListener("resize", handleResize);
    handleResize();

    function handleResize() {
      var sz = map.behaviors.get("scrollZoom");
      var mapContainerElem = map.container.getParentElement();
      var sizeVal = config.mapConfig.smallSizeBreakpoint;
      if (mapContainerElem.offsetHeight > sizeVal && !sz.isEnabled()) sz.enable();
      else if (mapContainerElem.offsetHeight <= sizeVal && sz.isEnabled()) sz.disable();
    }
  }


  function createSubCollns(ctgs, rootColln) {
    for (var i = 0; i < ctgs.length; i++) {
      var subColln = new ymaps.GeoObjectCollection({}, {
        preset: ctgs[i].ymapsPreset,
        iconImageHref: categoryService.getCategoryImage(ctgs[i].category),
        visible: false
      });
      lookup[ctgs[i].category] = subColln;

      if (ctgs[i].subcategories.length) {
        createSubCollns(ctgs[i].subcategories, subColln);
      } else {
        var points = ctgs[i].points.map(toGeoObjData);
        for (var j = 0; j < points.length; j++) {
          subColln.add(new ymaps.Placemark(points[j].coords, points[j].properties));
        }
      }
      rootColln.add(subColln);
    }
  }

  function displayPoint(data) {
    lookup[data.category].each(placemark => {
      if (placemark.properties.get(idField) == data.name) {
        placemark.balloon.open();
        var mapElem = placemark.getMap().container.getParentElement();
        mapElem.scrollIntoView();
      }
    });
  }

  function toggleImages(bShow) {
    for (var collnName in lookup) {
      var colln = lookup[collnName];
      if (collnName != rootName) {
        colln.options.set("iconLayout",
          bShow ? "default#image" : colln.options.resolve("iconContent"));
      }
    }
  }

  function handleResize() {

  }


  // duplication, TODO extract to some maps common module
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
  function fromGeoObjData(geoObjData) {
    var result = {
      lat: +geoObjData.coords[0].toFixed(7),
      long: +geoObjData.coords[1].toFixed(7)
    };
    Object.assign(result, geoObjData.properties);
    return Point.create(result);
  }


  return {
    init: init,
    displayPoint: displayPoint,
    showCategory:  c => lookup[c.category] && lookup[c.category].options.set("visible", undefined),
    hideCategory: c => lookup[c.category] && lookup[c.category].options.set("visible", false),
    toggleImages: toggleImages
  }

}();