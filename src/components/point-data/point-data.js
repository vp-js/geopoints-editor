"use strict"

var pointDataForm = (function() {
  var formWrapper, formElem, imgUpload;

  function init(app) {
    formElem = document.forms.point_data;
    //formWrapper = document.closest(".point-data-wrapper");
    imgUpload = ImageUpload.createImageUploadElem(formElem);
    renderCategoriesSelect(formElem.elements.category);

    var selectedAction;
    formElem.elements.action.forEach(btn => btn.onclick = function(e) {selectedAction = this.value});

    // autocomplete town by KLADR
    $(formElem.elements.town).kladr({type: $.kladr.type.city, typeCode: $.kladr.typeCode.city});

    formElem.onsubmit = function(e) {
      e.preventDefault();
      switch (selectedAction) {
        case "save": app.savePoint(); break;
        case "remove": app.removePoint(); break;
        default: throw new Error("No handler for this form action");
      }
    }

    // customize field msg
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
    renderOptions(Category.createCtgsHierarchy(), selectElem, "");
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


  return {
    toCreateMode: toCreateMode,
    toEditMode: toEditMode,
    hide: hide,

    getElements: () => formElem.elements,
    clear: () => formElem.reset(),
    getImg: () => imgUpload.getImgElem(),
    setImg: (imgSrc) => imgUpload.createImgElem(imgSrc || null),

    init: init
  }

}());
