ymaps.ready(adminInit, function(error) {alert("Error loading yandex maps: " + error.message)});

function adminInit() {
  var infoBlock = createInfoBlock(document.querySelector(".mainInfo"));
  window.addEventListener("error", err => infoBlock.showError(err));

  storage.init(appConfig);
  ymapsProvider.init(appConfig);
  pointsEditor.init(pointData, ymapsProvider, infoBlock);
  pointData.init(pointsEditor, document.forms.point_data);
  importExport.init(infoBlock);

  // save points before exit
  window.addEventListener("unload", () => pointService.saveAll(ymapsProvider.getPoints()));
}