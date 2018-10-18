"use strict"

// TODO refactor all
function CategoriesList(options, config) {
  var innerEventsManager = (function() {
    var handlers = {};
    return {
      subscribe(type, handler) {
        handlers[type] || (handlers[type] = []);
        handlers[type].push(handler);
      },
      notify(type, data) {
        handlers[type].forEach(f => f(data));
      }
    }
  })();
  // var innerEvents = {
  //   handlers: {},
  //   subscribe: function(type, handler) {
  //     handlers[type] || handlers[type] = [];
  //     handlers[type].push(handler);
  //   },
  // };

  var bAnimated = true;
  var bImagesRendered;

  var elem = document.createElement("div");
  elem.className = "categories";
  function getElem() {
    if (!options.ctgs || !options.ctgs.length) {
      elem.textContent = "No categories availabe";
    } else if (!elem.firstElementChild) {
      render();
    }
    return elem;
  }

  // fix for demo
  function searchCtg(id) {
    for (var i = 0; i < options.ctgs.length; i++) {
      if (options.ctgs[i].category == id) {
        return options.ctgs[i];
      }
      for (var j = 0; j < options.ctgs[i].subcategories.length; j++) {
        var ctg = options.ctgs[i].subcategories[j];
        if (ctg.category == id) {
          return ctg;
        }
      };
    };
  }

  function toggleImages(bShow) {
    if (!bImagesRendered) {
      var ctgElems = elem.getElementsByClassName("category");
      for (var i = 0; i < ctgElems.length; i++) {
        var ctg = searchCtg(ctgElems[i].dataset.category);
        var categoryImage = document.createElement("img");
        categoryImage.src = config.imgFolder + (ctg.image || config.imageStub);
        categoryImage.onerror = function(e) {
          e.target.src = config.imgFolder + config.imageStub;
        }
        //categoryImage.alt = "Error in image path";
        ctgElems[i].insertBefore(categoryImage, ctgElems[i].firstElementChild);
      }
      bImagesRendered = true;
    }
    if (bShow) {
      elem.classList.remove("images-hidden");
    } else {
      elem.classList.add("images-hidden");
    }
  }

  function render() {
    renderList(options.ctgs, elem);
    if (elem.firstElementChild) elem.firstElementChild.classList.remove("is-collapsed");

    function renderList(ctgs, prevElem) {
      var ul = document.createElement("ul");
      ul.classList.add("is-collapsed");
      ul.classList.add(prevElem == elem ? "categories-list" : "subcategories-list"); // fix for demo
      for (var i = 0; i < ctgs.length; i++) {
        var li = document.createElement("li");

        // create secton header with name and image
        var headerDiv = document.createElement("div");
        headerDiv.classList.add("category");
        headerDiv.setAttribute("data-category", ctgs[i].category);
        //headerDiv.id = ctgs[i].category;
        if (options.useCustomImages) {
          var categoryImage = document.createElement("img");
          categoryImage.src = config.imgFolder + (ctgs[i].image || config.imageStub);
          categoryImage.onerror = function(e) {
            e.target.src = config.imgFolder + config.imageStub;
          };
          //categoryImage.alt = "Error in image path";
          headerDiv.appendChild(categoryImage);
        }
        var a = document.createElement("a");
        a.textContent = ctgs[i].name;
        //a.setAttribute("href", "#");
        headerDiv.appendChild(a);
        li.appendChild(headerDiv);

        // create category points
        if (ctgs[i].points && ctgs[i].points.length) {
          var pointUl = document.createElement("ul");
          pointUl.className = "category-items";
          pointUl.classList.add("is-collapsed");
          for (var j = 0; j < ctgs[i].points.length; j++) {
            var pointLi = document.createElement("li");
            pointLi.textContent = ctgs[i].points[j].name;
            pointUl.appendChild(pointLi);
          }
          li.appendChild(pointUl);
        }

        renderList(ctgs[i].subcategories, li);
        ul.appendChild(li);
      }
      if (ctgs.length) prevElem.appendChild(ul); // no need in empty lists
    }
  }

  elem.addEventListener("click", function(e) {
    if (e.target.classList.contains("category")) {
      toggle(e.target);
    } else if (e.target.tagName == "LI") {
      var name = e.target.textContent;
      var category = e.target.parentElement.previousElementSibling.dataset.category;
      innerEventsManager.notify("selectItem", {name, category});
    }
  });


  function toggle(headerDiv) {
    var ul = headerDiv.nextElementSibling;
    if (!ul) return;

    var category = headerDiv.dataset.category;
    if (ul.classList.contains("is-collapsed")) {
      expandList(ul);
      innerEventsManager.notify("showCategory", {category});
    } else {
      collapseList(ul);
      innerEventsManager.notify("hideCategory", {category});
    }
  };

  function collapseList(ul) {
    if (!ul) return;
    if (!bAnimated) {
      ul.classList.add("is-collapsed");
      return;
    }
    var ulHeight = ul.offsetHeight;
    var ulTransition = ul.style.transition;
    ul.style.transition = "";
    requestAnimationFrame(function() {
      ul.style.height = ulHeight + "px";
      ul.style.transition = ulTransition;
      requestAnimationFrame(function() {
        ul.style.height = 0;

        // works correctly without it, but need for consistency and to fix for manual animation toggle
        ul.addEventListener("transitionend", function f() {
          ul.removeEventListener("transitionend", f /*arguments.callee*/);
          ul.style.height = null;
          ul.classList.add("is-collapsed");
        });
      });
    });
  }

  function expandList(ul) {
    if (!ul) return;
    if (!bAnimated) {
      ul.classList.remove("is-collapsed");
      return;
    }
    ul.style.height = ul.scrollHeight + "px";
    ul.addEventListener("transitionend", function f() {
      ul.removeEventListener("transitionend", f /*arguments.callee*/);
      ul.style.height = null;
      ul.classList.remove("is-collapsed");
    });
  }


  /*this.isAnimated = function() {
    return bAnimated;
  }
  this.setAnimated = function(a) {
    bAnimated = a;
  }*/

  Object.defineProperty(this, "animated", {
    get: () => bAnimated,
    set: (value) => (bAnimated = value)
  });

  this.getElem = getElem;
  this.toggleImages = toggleImages;
  this.subscribe = innerEventsManager.subscribe;
}