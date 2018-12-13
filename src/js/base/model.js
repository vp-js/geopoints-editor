"use strict"

function Category(params) {
  const FIELD_NAMES = ["category", "parentId", "name", "ymapsPreset", "image"]; // TODO change the approach

  var bIncorrectParam = Object.keys(params).some(fieldName => !FIELD_NAMES.includes(fieldName));
  if (bIncorrectParam) {
    throw new Error("Incorrect parameter in Category constructor, must be only " + FIELD_NAMES.join(","));
  }

  Object.assign(this, params);
}

var Point = {
  create: function(params) {
    var newPoint = Object.create(Point);
    Object.assign(newPoint, params);
    return newPoint;
  },
  getId: function() {
    return this.name;
  }
}
