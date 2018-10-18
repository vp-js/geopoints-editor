"use strict"

var ymsMain = (function(app, config) {

  app.init = function() {
    var map = new ymaps.Map("mainMap", {center: config.mapCenter, zoom: config.mapZoom}, {});

    ymaps.template.filtersStorage.add("getImage", (data, name, param) => storage.getImage(name));

    var categoriesList = new CategoriesList({ctgs: Category.createCtgsHierarchy(true)}, config);
    var elem = categoriesList.getElem();
    var mainDiv = document.querySelector("main"); // append to first div
    mainDiv.insertBefore(elem, document.getElementById("mainMap"));

    var rootColln = new ymaps.GeoObjectCollection({}, {
      preset: config.pointsConfig.defaultPreset,
      visible: true,
      iconImageSize: [30, 30],
      iconImageOffset: [-15, -15],
      balloonContentLayout: ymaps.templateLayoutFactory.createClass(config.balloonLayout)
    });

    var lookup = {root: rootColln}; // object to facilitate collection search
    createSubCollns(Category.createCtgsHierarchy(true), rootColln);
    map.geoObjects.add(rootColln);

    categoriesList.subscribe("showCategory", c => lookup[c.category] && lookup[c.category].options.set("visible", undefined));
    categoriesList.subscribe("hideCategory", c => lookup[c.category] && lookup[c.category].options.set("visible", false));
    categoriesList.subscribe("selectItem", displayByName);

    function displayByName(data) {
      lookup[data.category].each(placemark => {
        if (placemark.properties.get(config.nameField) == data.name) {
          placemark.balloon.open();
        }
      });
    }


    function createSubCollns(ctgs, rootColln) {
      for (var i = 0; i < ctgs.length; i++) {
        var subColln = new ymaps.GeoObjectCollection({}, {
          preset: ctgs[i].ymapsPreset,
          iconImageHref: config.imgFolder + ctgs[i].image,
          visible: false
        });
        lookup[ctgs[i].category] = subColln;

        if (ctgs[i].subcategories.length) {
          createSubCollns(ctgs[i].subcategories, subColln);
        } else {
          var points = ctgs[i].points.map(Point.toGeoObjData);
          for (var j = 0; j < points.length; j++) {
            subColln.add(new ymaps.Placemark(points[j].coords, points[j].properties));
          }
        }
        rootColln.add(subColln);
      }
    }

    document.getElementById("animateMenu").onclick = function(e) {
      categoriesList.animated = this.checked;
    }
    document.getElementById("useCustomImages").onclick = function(e) {
      for (let collnName in lookup) {
        let colln = lookup[collnName];
        if (collnName != "root") {
          colln.options.set("iconLayout",
            this.checked ? "default#image" : colln.options.resolve("iconContent"));
        }
      }
      categoriesList.toggleImages(this.checked);
    }

    // for demo
    var firstCtg = document.querySelector(".categories .category");
    firstCtg.click();
    firstCtg.nextElementSibling.querySelector(".category").click();

    map.container.fitToViewport(); // demo fix
  }

  return app;

})({}, appConfig);
