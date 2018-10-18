"use strict"

var ImageUpload = {

  createImageUploadElem: function(form) {
    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    const imageSize = 1024*1024; // 1M for now
    const validationMsgDelay = 5000;

    var containerElem = form.querySelector(".imgupload-container");
    var fileElem = containerElem && containerElem.querySelector("input[type='file']");
    var imgSlotElem = containerElem && containerElem.querySelector(".imgupload-imgslot");
    if (!containerElem || !fileElem || !imgSlotElem) throw new Error("No appropriate element in the form for img upload initialization");

    var imgMaxHeight = imgSlotElem.clientHeight;
    var imgMaxWidth = imgSlotElem.clientWidth;

    containerElem.onclick = () => fileElem.click(); // input itself is hidden, make whole control react on click


    fileElem.onchange = function(e) {
      var reader = new FileReader();
      reader.onload = function(e) {
        ImageUpload.resizeBase64Img(reader.result, imgMaxWidth, imgMaxHeight)
          .then((resized) => createImgElem(resized)).catch(e => {throw new Error("Error processing image")});
      }

      if (fileElem.files[0].size < imageSize && validImageTypes.includes(fileElem.files[0].type)) {
        containerElem.classList.remove("img-custom-validation");
        reader.readAsDataURL(fileElem.files[0]);
      } else {
        createImgElem(null);
        containerElem.classList.add("img-custom-validation");
        setTimeout(() => containerElem.classList.remove("img-custom-validation"), validationMsgDelay);
      }
    }

    form.addEventListener("reset", () => createImgElem(null)); // clear image

    // helper function for img creation
    function createImgElem(src) {
      // remove existing
      var prevImg = imgSlotElem.querySelector("img");
      if (prevImg) imgSlotElem.removeChild(prevImg);

      // create new
      if (src) {
        var img = new Image();
        img.classList.add("imgupload-img");
        img.alt = "No image";
        img.src = src;
        imgSlotElem.appendChild(img);
      }
    }

    return {
      createImgElem: createImgElem,
      getImgElem: () => containerElem.querySelector("img")
    }
  },


  resizeBase64Img: function(base64, width, height) {
    if (!width || !height) return Promise.reject("Incorrect image size provided");

    var p = new Promise(function(resolve, reject) {
      var img = document.createElement("img");
      img.src = /*"data:image/gif;base64," +*/ base64;
      img.onload = function() {
        var ratio = Math.min(width/img.width, height/img.height);
        var canvas = document.createElement("canvas");

        // this makes canvas having same size with image, otherwise empty space on canvas
        canvas.width = img.width*ratio;
        canvas.height = img.height*ratio;

        var context = canvas.getContext("2d");
        context.scale(ratio,  ratio);
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      }
      img.onerror = () => reject("Error loading image");
    });

    return p;
  }
};
