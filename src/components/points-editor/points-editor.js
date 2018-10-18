"use strict"

const ymsApp = (function() {

  // TODO modify state handling
  const AppState = Object.freeze({
    VIEW: 1,
    CREATE: 2,
    EDIT: 3
  });

  var currentState = AppState.VIEW;

  function setState(state) {
    if (state == currentState) return;

    //clearCurrentState();
    switch (state) {
      case AppState.VIEW:
        pointsMap.toViewMode(currentState);
        pointDataForm.clear();
        pointDataForm.hide();
        break;

      case AppState.CREATE:
        pointsMap.toCreateMode(currentState);
        pointDataForm.clear();
        pointDataForm.toCreateMode();
        break;

      case AppState.EDIT:
        pointsMap.toEditMode(currentState);
        pointDataForm.toEditMode();
        break;

      default: throw new Error("Invalid app state provided");
    }

    currentState = state;
  }

  /*function clearCurrentState() {
    switch (currentState) {
      case AppState.VIEW:
        break;
      case AppState.CREATE:
        break;
      case AppState.EDIT:
        pointDataForm.clear();
        break;
    }
  }*/

  return {
    AppState: AppState,
    setState: setState
  }

})();


(function(app, config) {
  /*app.action = function(newAction) {
    if (newAction) formAction = newAction;
    else return formAction;
  }*/
  /*Object.defineProperty(app, "action", {
    get: function() { return formAction; },
    set: function(newAction) { formAction = newAction; }
  });*/

  app.init = function() {
    var infoBlock = createInfoBlock(document.querySelector(".map-container"));
    app.showInfo = infoBlock.showInfo;
    window.addEventListener("error", err => infoBlock.showError(err));

    pointsMap.init(app, config);
    pointDataForm.init(app);

    app.displayPoint = function(point) {
      pointToForm(point, pointDataForm);
    }

    app.savePoint = function() {
      var point = pointsMap.getCurrentPoint();
      if (!point) {
        infoBlock.showWarning("No point selected");
      } else {
        formToPoint(pointDataForm, point);
        pointsMap.saveCurrentPoint();
        pointDataForm.clear();
        infoBlock.showInfo("Saved");
      }
    }

    app.removePoint = function() {
      var point = pointsMap.getCurrentPoint();
      if (!point) {
        infoBlock.showWarning("No point selected");
      } else {
        pointsMap.removeCurrentPoint();
        pointDataForm.clear();
        infoBlock.showInfo("Removed");
      }
    }
  }


  function formToPoint(pointDataForm, point) {
    var elements = pointDataForm.getElements();
    for (var i = 0; i < elements.length; i++) {
      if (!["submit", "button", "file"].includes(elements[i].type))
        point.properties.set(elements[i].name, elements[i].value);
    };

    // sync geo object specific props
    var pointName = elements[config.nameField].value;
    point.properties.set("iconContent", pointName);

    // store image
    var img = pointDataForm.getImg();
    if (img) storage.saveImage(pointName, img.src);
  }

  function pointToForm(point, pointDataForm) {
    var elements = pointDataForm.getElements();
    for (var i = 0; i < elements.length; i++) {
      if (!["submit", "file"].includes(elements[i].type))
        elements[i].value = point.properties.get(elements[i].name) || ""; // clear 'undefineds'
    };

    // retrieve image
    var pointName = point.properties.get("iconContent");
    pointDataForm.setImg(storage.getImage(pointName));
  }

}(ymsApp, appConfig));
