"use strict"

var pointData = function() {
  var formElem, imgUpload;

  function init(pointsEditor, form) {
    formElem = form;
    renderCategoriesSelect(formElem.elements.category);
    imgUpload = ImageUpload.createImageUploadElem(formElem);

    // autocomplete town by KLADR
    $(formElem.elements.town).kladr({
      type: $.kladr.type.city,
      typeCode: $.kladr.typeCode.city
    });

    // modify submit behavior
    var selectedAction;
    formElem.elements.action.forEach(
      btn => btn.onclick = function(e) {
        selectedAction = this.value;
    });
    formElem.onsubmit = function(e) {
      e.preventDefault();
      switch (selectedAction) {
        case "save": pointsEditor.savePoint(); break;
        case "remove": pointsEditor.removePoint(); break;
        default: throw new Error("No handler for this form action");
      }
    }

    // customize fields validation msg
    formElem.addEventListener("invalid", function(e) {
      var elem = e.target;
      if (elem.title && !elem.validity.valid) {
        elem.setCustomValidity(elem.title);
      }
    }, true);
    formElem.addEventListener("input", function(e) {
      var elem = e.target;
      if (elem.title && !elem.validity.valid) {
        elem.setCustomValidity("");
      }
    }, false);
  }


  function toCreateMode() {
    formElem.dataset.mode = "create";
  }
  function toEditMode() {
    formElem.dataset.mode = "edit";
  }
  function hide() {
    formElem.dataset.mode = "hidden";
  }


  function renderCategoriesSelect(selectElem) {
    renderOptions(categoryService.createCtgsHierarchy(), selectElem, "");
    selectElem.setAttribute("required", "");

    var defaultIsSet = false;
    function renderOptions(ctgs, selectElem, indent) {
      for (var i = 0; i < ctgs.length; i++) {
        var option = document.createElement("option");
        option.value = ctgs[i].category;
        option.innerHTML = indent+ctgs[i].name; // assign text by innerHTML to avoid space removal by browser
        selectElem.appendChild(option);
        if (ctgs[i].subcategories.length) {
          option.setAttribute("disabled", true);
          renderOptions(ctgs[i].subcategories, selectElem, indent+"&nbsp;");
        } else if (!defaultIsSet) {
          option.setAttribute("selected", "");
          defaultIsSet = true;
        }
      }
    }
  }

  function getPoint() {
    var elements = formElem.elements;
    var point = Point.create();
    for (var i = 0; i < elements.length; i++) {
      if (!["submit", "button", "file"].includes(elements[i].type))
        point[elements[i].name] = elements[i].value;
    }

    // store image
    var img = imgUpload.getImgElem();
    if (img) pointService.savePointImage(point.getId(), img.src);

    return point;
  }

  function setPoint(point) {
    var elements = formElem.elements;
    for (var i = 0; i < elements.length; i++) {
      if (!["submit", "button", "file"].includes(elements[i].type))
        elements[i].value = point[elements[i].name] || ""; // clear 'undefineds'
    }

    // retrieve image
    var imgSrc = pointService.getPointImage(point.getId());
    imgUpload.createImgElem(imgSrc || null);
  }

  return {
    toCreateMode: toCreateMode,
    toEditMode: toEditMode,
    hide: hide,
    clear: () => formElem.reset(),
    setPoint: setPoint,
    getPoint: getPoint,
    init: init
  }

}();
