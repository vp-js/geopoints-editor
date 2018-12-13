"use strict"

async function mainInit() {
  storage.init(appConfig);
  await loadDemoData(); // TODO fix because it's async

  mainMap.init(appConfig);

  var categoriesList = new CategoriesList({ctgs: categoryService.createCtgsHierarchy(true)});
  var elem = categoriesList.getElem();
  var mainDiv = document.querySelector("main"); // append to first div ?
  mainDiv.insertBefore(elem, document.getElementById("mainMap"));

  categoriesList.subscribe("showCategory", mainMap.showCategory);
  categoriesList.subscribe("hideCategory", mainMap.hideCategory);
  categoriesList.subscribe("selectItem", mainMap.displayPoint);

  initDisplayOptions();
  demoInit();


  function initDisplayOptions() {
    document.getElementById("animateMenu").onclick = function(e) {
      categoriesList.animated = this.checked;
    }
    document.getElementById("useCustomImages").onclick = function(e) {
      mainMap.toggleImages(this.checked);
      categoriesList.toggleImages(this.checked);
    }
  }


  // temp
  function demoInit() {
    if (appConfig.appMode != "demo") return;

    var firstCtg = document.querySelector(".categories .category");
    firstCtg.click();
    firstCtg.nextElementSibling.querySelector(".category").click();

    /*var i18n = $.i18n();
    i18n.locale = "ru";
    fetch("data/localization.json").then((res) => res.text()).then(
      function(t) {
        i18n.load(JSON.parse(t)).done(
          function() {
            $("body").i18n();
          });
      });*/
  }


  async function loadDemoData() {
    if (appConfig.appMode != "demo" || sessionStorage.getItem("demoDataLoaded")) return;
    sessionStorage.setItem("demoDataLoaded", "true");

    var p1 = fetch("data/ymaps_spravochnik_categories.csv", {mode: "no-cors", headers: {"Content-Type": "text/csv"}})
      .then(response => response.text()).then(importExport.parseCsv).then(storage.saveCategories).catch(tempLog);
    var p2 =  fetch("data/ymaps_spravochnik_points.csv", {mode: "no-cors", headers: {"Content-Type": "text/csv"}})
      .then(response => response.text()).then(importExport.parseCsv).then(storage.savePoints).catch(tempLog);
    var p3 = fetch("data/demo_images.json").then(response => response.text()).then(JSON.parse)
      .then(imgs => {for (var img in imgs) {storage.saveImage(img, imgs[img]);}}).catch(tempLog);

    await Promise.all([p1, p2, p3]);

    function tempLog(e) {
      console.log(e);
      alert("Error loading demo data");
    }
  }

}


ymaps.ready(mainInit, function(error) {alert("Error loading ymaps: " + error)});