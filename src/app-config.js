const appConfig = {

  mapConfig: {
    mainMapElemId: "mainMap",
    editMapElemId: "ymsMap",
    smallSizeBreakpoint: 400,
    mapCenter: [54.8, 32],
    mapZoom: 11,
    autoFitToViewport: "ifNull",
    suppressMapOpenBlock: true
  },

  pointsConfig: {
    color: {
      "VIEW": "green",
      "CREATE": "yellow",
      "EDIT": "orange"
    },
    defaultPreset: "islands#greenStretchyIcon"
  },

  // goes as icon content for placemark on map, for training/demo purposes use as id
  idField: "name",

  balloonLayout: [
    "<div style='width: 250px'>",
      "<img style='float: right; height: 70px; width: 70px; max-width: 100px;'",
        "src={{properties.name|getImage: ''}} alt='No image'",
        ">",
      "<h3>{{properties.name}}</h3>",
      "<b>Town: </b> {{properties.town}}<br>",
      "<b>Address: </b> {{properties.address}}<br>",
      "<b>Phone: </b> {{properties.phone}}<br>",
      "<b>Mail: </b> {{properties.mail}}<br>",
      "<b>Website: </b> <a href={{properties.website}}>{{properties.website}}</a><br>",
      "<b>Opening time: </b> {{properties.openingTime}}<br>",
      "<br>",
      "{{properties.description}}",
    "</div>"
  ].join('\n'),

  imagesConfig: {
    imgStoragePrefix: "image_",
    imgFolder: "images/",
    imageStub: "No_Image_Available.png"
  },


  // values: localdev, demo
  appMode: "demo"

};