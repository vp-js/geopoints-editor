"use strict"

const categoryService = function() {
  var config = appConfig; // TODO inject

  function getCategory(categoryId) {
    return getAll().filter(ctg => ctg.category == categoryId)[0];
  }
  function getCategoryImage(categoryId) {
    var category = getCategory(categoryId);
    var res = config.imagesConfig.imgFolder +
      (category && category.image || config.imagesConfig.imageStub);
    return res;
  }

  function getAll() {
    return storage.getCategories();
  }
  function saveAll(categories) {
    storage.saveCategories(categories);
  }

  function createCtgsHierarchy(bWithPoints) {
    var ctgsHierarchy = getAll().filter(elem => elem.parentId == 0);
    createSubcategories(ctgsHierarchy);

    function createSubcategories(arr) {
      for (var i = 0; i < arr.length; i++) {
        arr[i].subcategories = getAll().filter(elem => elem.parentId == arr[i].category);

        // for now assume in category tree only leaf, not branch, has points
        if (arr[i].subcategories.length) {
          createSubcategories(arr[i].subcategories);
        } else if (bWithPoints) {
          arr[i].points = pointService.getAll().filter(elem => elem.category == arr[i].category);
        }
      }
    }

    return ctgsHierarchy;
  }

  return {
    createCtgsHierarchy: createCtgsHierarchy,
    getCategory: getCategory,
    getCategoryImage: getCategoryImage,
    getAll: getAll,
    saveAll: saveAll
  }

}();




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
