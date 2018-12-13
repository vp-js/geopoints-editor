"use strict"

function CategoriesList(options = {ctgs: []}) {
  var elem = document.createElement("div");

  function getElem() {
    if (!elem.firstElementChild) render(options.ctgs);
    return elem;
  }

  function render(ctgs) {
    if (!ctgs.length) {
      elem.textContent = "No categories availabe";
      return;
    }
    elem.className = "categories images-hidden";
    elem.appendChild(renderList(ctgs, true));

    function renderList(ctgs, isRoot) {
      if (!ctgs.length) return;

      var ul = document.createElement("ul");
      if (isRoot) {
        ul.classList.add("categories-list");
      } else {
        ul.classList.add("subcategories-list");
        ul.classList.add("is-collapsed");
      }

      for (var i = 0; i < ctgs.length; i++) {
        var li = document.createElement("li");
        li.insertAdjacentHTML("beforeEnd", ctgHeaderDivTemplate(ctgs[i]));

        var subctgs = renderList(ctgs[i].subcategories);
        if (subctgs) li.appendChild(subctgs);

        if (ctgs[i].points && ctgs[i].points.length)
          li.insertAdjacentHTML("beforeEnd", ctgPointsListTemplate(ctgs[i].points));

        ul.appendChild(li);
      }

      return ul;
    }

    function ctgHeaderDivTemplate(ctg) {
      var resStr =
        `<div class="category" data-category="${ctg.category}">
          <img src="${categoryService.getCategoryImage(ctg.category)}" alt="">
          <a>${ctg.name}</a>
        </div>`;
      return resStr;
    }
    function ctgPointsListTemplate(points) {
      var resStr =
        `<ul class="category-items is-collapsed">
          ${points.map(point => `<li>${point.name}</li>`).join("")}
        </ul>`;
      return resStr;
    }
  }


  elem.addEventListener("click", function(e) {
    if (e.target.classList.contains("category")) {
      var ul = e.target.nextElementSibling;
      var category = e.target.dataset.category;
      if (ul) toggle(ul, category);
    } else if (e.target.tagName == "LI") {
      var ctgHeader = e.target.parentElement.previousElementSibling;
      if (!ctgHeader) return; // it's not item LI
      var name = e.target.textContent;
      var category = ctgHeader.dataset.category;
      innerEventsManager.notify("selectItem", {name, category});
    }
  });

  function toggle(ul, category) {
    if (ul.classList.contains("is-collapsed")) {
      if (isAnimated) expandList(ul);
      else ul.classList.remove("is-collapsed");
      innerEventsManager.notify("showCategory", {category});
    } else {
      if (isAnimated) collapseList(ul);
      else ul.classList.add("is-collapsed");
      innerEventsManager.notify("hideCategory", {category});
    }
  }

  function collapseList(ul) {
    var ulHeight = ul.offsetHeight;
    var ulTransition = ul.style.transition;
    ul.style.transition = "";
    requestAnimationFrame(function() {
      ul.style.height = ulHeight + "px";
      ul.style.transition = ulTransition;
      requestAnimationFrame(function() {
        ul.style.height = 0;

        // works correctly without it, but need for consistency and to fix for manual animation toggle
        ul.addEventListener("transitionend", function ontransitionend() {
          ul.removeEventListener("transitionend", ontransitionend);
          ul.style.height = null;
          ul.classList.add("is-collapsed");
        });
      });
    });
  }

  function expandList(ul) {
    ul.style.height = ul.scrollHeight + "px";
    ul.addEventListener("transitionend", function ontransitionend() {
      ul.removeEventListener("transitionend", ontransitionend);
      ul.style.height = null;
      ul.classList.remove("is-collapsed");
    });
  }


  // TODO extract to component?
  var innerEventsManager = function() {
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
  }();


  var isAnimated = true;
  Object.defineProperty(this, "animated", {
    get: () => isAnimated,
    set: (value) => (isAnimated = value)
  });

  this.getElem = getElem;
  this.toggleImages = () => elem.classList.toggle("images-hidden");
  this.subscribe = innerEventsManager.subscribe;
}