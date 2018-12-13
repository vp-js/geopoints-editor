"use strict"

const pointsEditor = function() {
  var pointData, mapProvider, infoBlock;

  const State = Object.freeze({
    VIEW: 1,
    CREATE: 2,
    EDIT: 3
  });
  var currentState = State.VIEW;

  function setState(state) {
    if (state == currentState) return;

    clearCurrentState();

    switch (state) {
      case State.VIEW:
        pointData.hide();
        break;
      case State.CREATE:
        mapProvider.setCreate(true);
        pointData.toCreateMode();
        break;
      case State.EDIT:
        mapProvider.setEdit(true);
        pointData.toEditMode();
        break;
      default: throw new Error("Invalid app state provided");
    }

    currentState = state;
  }

  function clearCurrentState() {
    switch (currentState) {
      case State.VIEW:
        pointData.clear();
        break;
      case State.CREATE:
        mapProvider.setCreate(false);
        pointData.clear();
        break;
      case State.EDIT:
        mapProvider.setEdit(false);
        pointData.clear();
        break;
    }
  }


  function viewPoint(point) {
    pointData.setPoint(point);
  }

  function savePoint() {
    if (!mapProvider.getCurrentPoint()) {
      infoBlock.showWarning("No point selected");
    } else {
      var point = pointData.getPoint();
      mapProvider.saveCurrentPoint(point);
      pointData.clear();
      infoBlock.showInfo("Saved");
    }
  }

  function removePoint() {
    var point = mapProvider.getCurrentPoint();
    if (!point) {
      infoBlock.showWarning("No point selected");
    } else {
      mapProvider.removeCurrentPoint();
      pointData.clear();
      infoBlock.showInfo("Removed");
    }
  }


  function init(pointData_, mapProvider_, infoBlock_) {
    [pointData, mapProvider, infoBlock] = [pointData_, mapProvider_, infoBlock_];

    mapProvider.createMap();
    mapProvider.addPoints(pointService.getAll());

    mapProvider.initControls({
      createOn: () => setState(State.CREATE),
      createOff: () => setState(State.VIEW),
      editOn: () => setState(State.EDIT),
      editOff: () => setState(State.VIEW)
    });

    mapProvider.initExtCallbacks({
      onPointEdit: () => viewPoint(mapProvider.getCurrentPoint())
    });
  }


  return {
    savePoint: savePoint,
    removePoint: removePoint,
    init: init
  }

}();
