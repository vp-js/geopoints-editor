"use strict"

function Category(params) {
  const FIELD_NAMES = ["category", "parentId", "name", "ymapsPreset", "image"]; // TODO change the approach

  var bIncorrectParam = Object.keys(params).some(fieldName => !FIELD_NAMES.includes(fieldName));
  if (bIncorrectParam) {
    throw new Error("Incorrect parameter in Category constructor, must be only " + FIELD_NAMES.join(","));
  }

  Object.assign(this, params);
}


Category.createCtgsHierarchy = function(bWithPoints) {
  var ctgsHierarchy = storage.getCategories().filter(elem => elem.parentId == 0);
  createSubcategories(ctgsHierarchy);

  function createSubcategories(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i].subcategories = storage.getCategories().filter(elem => elem.parentId == arr[i].category);

      // at the moment assume in category tree only leaf, not branch, has points
      if (arr[i].subcategories.length) {
        createSubcategories(arr[i].subcategories);
      } else if (bWithPoints) {
        arr[i].points = storage.getPoints().filter(elem => elem.category == arr[i].category);
      }
    }
  }

  return ctgsHierarchy;
}

/*
Category.createCtgsHierarchyAssoc = function(bWithPoints) {
  var hierarchyAssoc = {};
  ctgsHierarchy.forEach((ctg) => hierarchyAssoc[ctg.category] = ctg);
  createSubcategoriesAssoc(hierarchyAssoc);

  function createSubcategoriesAssoc(ctgs) {
    for (var ctgId in ctgs) {
      var ctg = ctgs[ctgId];
      ctg.subcategories = {};
      var subs = storage.getCategories().filter(elem => elem.parentId == ctgId);
      subs.forEach((sub) => ctg.subcategories[sub.category] = sub);

      // at the moment assume in category tree only leaf, not branch, has points
      if (Object.keys(ctg.subcategories).length) {
        createSubcategories(ctg.subcategories);
      } else if (bWithPoints) {
        ctg.points = storage.getPoints().filter(elem => elem.category == ctg.category);
      }
    }
  }

  return hierarchyAssoc;
}
*/


/* TODO

const converter = (function() {
  function toGeoObjData(points) {
    return points.map(Point.toGeoObjData);
  }
  function fromGeoObjData(geoObjData) {
    return points.map(Point.fromGeoObjData);
  }

  return {
    toGeoObjData: toGeoObjData,
    fromGeoObjData: fromGeoObjData
  }
}());*/



var Point = {
  create: function(params) {
    var newPoint = Object.create(Point);
    Object.assign(newPoint, params);
    return newPoint;
  },
  getName: function() {
    return this.name;
  }
}

Point.toGeoObjData = function(plainData) {
  var result = {
    coords: [+plainData.lat, +plainData.long],
    properties: {
      category: plainData.category,
      name: plainData.name,
      description: plainData.description,
      town: plainData.town,
      address: plainData.address,
      phone: plainData.phone,
      website: plainData.website,
      mail: plainData.mail,
      openingTime: plainData.openingTime,

      // sync geo obj props
      iconContent: plainData.name
    }
  }
  return result;
}

Point.fromGeoObjData = function(geoObjData) {
  var result = {
    lat: +geoObjData.coords[0].toFixed(7),
    long: +geoObjData.coords[1].toFixed(7)
  };
  Object.assign(result, geoObjData.properties);

  return result;
}
