import {
  filterGallery,
  findKnown,
  normalizeSearch,
  searchText,
} from "./gallery-discovery-core.js";

const dataElement = document.querySelector("#gallery-data");
const configElement = document.querySelector("#gallery-discovery-data");
const galleryRoot = document.querySelector("[data-gallery]");
const statusClear = galleryRoot.querySelector("[data-gallery-clear-status]");

if (dataElement && configElement && galleryRoot) {
  const cakes = JSON.parse(dataElement.textContent);
  const config = JSON.parse(configElement.textContent);
  const batchSize = 30;

  const grid = galleryRoot.querySelector("[data-gallery-grid]");
  const heading = galleryRoot.querySelector("[data-gallery-result-heading]");
  const empty = galleryRoot.querySelector("[data-gallery-empty]");
  const emptyHeading = galleryRoot.querySelector(
    "[data-gallery-empty-heading]",
  );
  const sentinel = galleryRoot.querySelector("[data-gallery-sentinel]");
  const search = galleryRoot.querySelector("[data-gallery-search]");
  const searchClear = galleryRoot.querySelector("[data-gallery-search-clear]");
  const exploreButton = galleryRoot.querySelector("[data-gallery-explore]");
  const explorePanel = galleryRoot.querySelector(
    "[data-gallery-explore-panel]",
  );
  const pills = [...galleryRoot.querySelectorAll("[data-gallery-pill]")];
  const clearButtons = [
    ...galleryRoot.querySelectorAll("[data-gallery-clear]"),
  ];

  const dialog = document.querySelector("[data-cake-dialog]");
  const dialogImage = dialog?.querySelector("[data-cake-dialog-image]");
  const dialogCaption = dialog?.querySelector("[data-cake-dialog-caption]");
  const dialogContext = dialog?.querySelector("[data-cake-dialog-context]");
  const availability = dialog?.querySelector("[data-cake-context]");
  const previousButton = dialog?.querySelector("[data-cake-dialog-prev]");
  const nextButton = dialog?.querySelector("[data-cake-dialog-next]");

  let shown = batchSize;
  let state = {
    query: "",
    item: null,
  };

  let results = cakes;
  let previousFocus = null;
  let selectedCake = null;
  let closingDetail = false;
  let detailScrollY = 0;
  let searchTrackTimer = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  const track = (name, params = {}) =>
    window.PureBakesAnalytics?.trackEvent(name, params);

  const variant = (path, width) => path.replace(/\.webp$/i, `-${width}.webp`);

  const label = (value) =>
    value
      ? value
          .replaceAll("-", " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "Custom design";

  const titleCase = (value) =>
    searchText(value).replace(/\b\w/g, (letter) => letter.toUpperCase());

  const enquiryOccasion = (cake) => {
    const values = cake.occasions || [];

    if (values.includes("anniversary")) {
      return "anniversary";
    }

    if (values.includes("baby-shower")) {
      return "baby_shower";
    }

    if (
      values.includes("birthday") ||
      values.includes("first-birthday") ||
      values.includes("first-birthday-boy") ||
      values.includes("first-birthday-girl")
    ) {
      return "birthday";
    }

    return "";
  };

  function createCard(cake, position) {
    const article = document.createElement("article");
    article.className = "gallery-card";
    article.dataset.cakeId = cake.id;
    article.dataset.position = position;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.galleryOpen = cake.id;
    button.dataset.galleryAction = "image_open";
    button.dataset.cakeId = cake.id;
    button.setAttribute("aria-label", `View ${cake.caption}`);

    const image = document.createElement("img");
    image.className = "portfolio-cake-photo";
    image.src = variant(cake.image, 360);
    image.srcset =
      `${variant(cake.image, 360)} 360w, ` + `${variant(cake.image, 720)} 720w`;

    image.sizes =
      "(max-width: 47.99rem) calc(50vw - 1.2rem), " +
      "(max-width: 74.99rem) calc(33.333vw - 1.5rem), " +
      "calc(20vw - 1.5rem)";

    image.width = 1080;
    image.height = 1920;
    image.alt = cake.alt;

    // Existing lazy-loading behaviour intentionally preserved.
    image.loading = "lazy";
    image.decoding = "async";

    const copy = document.createElement("span");

    const small = document.createElement("small");
    small.textContent = label(cake.occasions[0]);

    const strong = document.createElement("strong");
    strong.textContent = cake.caption;

    copy.append(small, strong);
    button.append(image, copy);
    article.append(button);

    return article;
  }

  function resultText() {
    const display = search.value.trim();

    if (state.item && state.query) {
      return `${results.length} ${state.item.label} designs for “${display}”`;
    }

    if (state.item) {
      return `${results.length} ${state.item.label} cake designs`;
    }

    if (state.query) {
      return `${results.length} results for “${display}”`;
    }

    return `${results.length} cake designs`;
  }

  function hasMore() {
    return shown < results.length;
  }

  function syncStatus() {
    heading.textContent = resultText();

    empty.hidden = results.length !== 0;
    grid.hidden = results.length === 0;

    sentinel.hidden = results.length === 0 || !hasMore();

    searchClear.hidden = !search.value;

    if (statusClear) {
      statusClear.hidden = !state.query && !state.item;
    }

    emptyHeading.textContent = state.query
      ? `No cake designs found for “${search.value.trim()}”.`
      : "No matching cake designs found.";
  }

  function render({ append = false, from = 0 } = {}) {
    const visible = results.slice(0, shown);

    if (append) {
      const fragment = document.createDocumentFragment();

      visible.slice(from).forEach((cake, index) => {
        fragment.append(createCard(cake, from + index));
      });

      grid.append(fragment);
    } else {
      grid.replaceChildren(...visible.map(createCard));
    }

    syncStatus();
  }

  function syncControls() {
    pills.forEach((pill) => {
      const active = state.item
        ? pill.dataset.filterKey === state.item.key
        : pill.dataset.filterKey === "all";

      pill.setAttribute("aria-pressed", String(active));
    });

    exploreButton.classList.toggle("is-active", Boolean(state.item));
  }

  function updateUrl({ replace = false } = {}) {
    const url = new URL(window.location.href);

    url.searchParams.delete("search");
    url.searchParams.delete("filter");

    if (state.query) {
      url.searchParams.set("search", state.query);

      if (state.item) {
        url.searchParams.set("filter", state.item.key);
      }
    } else if (state.item) {
      /*
       * Keep existing landing-page compatibility:
       *
       * /gallery/?search=birthday
       * /gallery/?search=unicorn
       *
       * continue working exactly as before.
       */
      url.searchParams.set("search", state.item.key);
    }

    window.history[replace ? "replaceState" : "pushState"](
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function apply({ updateHistory = false, replaceHistory = false } = {}) {
    results = filterGallery(cakes, state);

    shown = batchSize;

    syncControls();
    render();

    if (updateHistory) {
      updateUrl({
        replace: replaceHistory,
      });
    }
  }

  function restoreFromUrl() {
    const url = new URL(window.location.href);

    const rawSearch = url.searchParams.get("search") || "";

    const rawFilter = url.searchParams.get("filter") || "";

    const query = normalizeSearch(rawSearch);

    const explicitItem = findKnown(config, normalizeSearch(rawFilter));

    /*
     * Existing links such as ?search=unicorn use
     * the search parameter as taxonomy discovery.
     */
    const legacyItem = explicitItem ? null : findKnown(config, query);

    state = {
      query: legacyItem ? "" : query,

      item: explicitItem || legacyItem,
    };

    search.value = state.query ? titleCase(state.query) : "";

    apply();
  }

  function reset({ updateHistory = true } = {}) {
    state = {
      query: "",
      item: null,
    };

    search.value = "";

    apply({
      updateHistory,
    });
  }

  function clearSearch({ updateHistory = true } = {}) {
    /*
     * Intentionally retain the selected Explore
     * occasion/theme while clearing only typed text.
     */
    state = {
      ...state,
      query: "",
    };

    search.value = "";

    apply({
      updateHistory,
    });

    search.focus();
  }

  /*
   * Filtering itself happens instantly.
   *
   * Analytics is intentionally delayed slightly so typing
   * "butterfly" does not generate nine search events.
   */
  function scheduleSearchTracking() {
    window.clearTimeout(searchTrackTimer);

    if (!state.query) {
      return;
    }

    searchTrackTimer = window.setTimeout(() => {
      const metrics = {
        search_used: true,
        search_length: search.value.trim().length,
        result_count: results.length,
      };

      track("gallery_search", metrics);

      if (!results.length) {
        track("gallery_search_no_results", metrics);
      }
    }, 500);
  }

  function loadNextBatch() {
    if (!hasMore()) {
      return;
    }

    const previousShown = shown;

    shown = Math.min(shown + batchSize, results.length);

    /*
     * Append only the new cards rather than rebuilding
     * already-visible images.
     */
    render({
      append: true,
      from: previousShown,
    });

    track("gallery_auto_load", {
      visible_count: shown,
      result_count: results.length,
    });
  }

  /*
   * Trigger the next batch before the visitor reaches
   * the actual bottom so scrolling feels continuous.
   */
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting) || !hasMore()) {
              return;
            }

            loadNextBatch();
          },
          {
            rootMargin: "800px 0px",
          },
        )
      : null;

  if (observer && sentinel) {
    observer.observe(sentinel);
  }

  exploreButton.addEventListener("click", () => {
    const open = exploreButton.getAttribute("aria-expanded") !== "true";

    exploreButton.setAttribute("aria-expanded", String(open));

    explorePanel.hidden = !open;
  });

  pills.forEach((pill) =>
    pill.addEventListener("click", () => {
      state = {
        ...state,

        item:
          pill.dataset.filterKey === "all"
            ? null
            : findKnown(config, pill.dataset.filterKey),
      };

      apply({
        updateHistory: true,
      });

      if (state.item) {
        track("gallery_filter", {
          filter_type: state.item.field === "themes" ? "theme" : "occasion",

          filter_key: state.item.key,

          result_count: results.length,
        });
      }

      if (matchMedia("(max-width: 47.99rem)").matches) {
        explorePanel.hidden = true;

        exploreButton.setAttribute("aria-expanded", "false");
      }
    }),
  );

  /*
   * Keep the semantic search form, but submitting it
   * is no longer necessary because results update live.
   */
  galleryRoot
    .querySelector("[data-gallery-search-form]")
    .addEventListener("submit", (event) => event.preventDefault());

  search.addEventListener("input", () => {
    const display = search.value.slice(0, 100);

    state = {
      ...state,
      query: normalizeSearch(display),
    };

    /*
     * replaceState avoids creating one browser-history
     * entry for every character typed.
     */
    apply({
      updateHistory: true,
      replaceHistory: true,
    });

    scheduleSearchTracking();
  });

  searchClear.addEventListener("click", () => clearSearch());

  clearButtons.forEach((button) =>
    button.addEventListener("click", () => reset()),
  );

  function setDialogCake(cake, { trackNavigation = false } = {}) {
    if (
      !cake ||
      !dialogImage ||
      !dialogCaption ||
      !dialogContext ||
      !availability
    ) {
      return;
    }

    selectedCake = cake;

    dialogImage.src = cake.image;

    dialogImage.alt = cake.alt;

    dialogCaption.textContent = cake.caption;

    dialogContext.textContent = label(cake.occasions[0]);

    availability.dataset.cakeId = cake.id;

    availability.dataset.cakeCaption = cake.caption;

    const occasion = enquiryOccasion(cake);

    if (occasion) {
      availability.dataset.occasion = occasion;
    } else {
      delete availability.dataset.occasion;
    }

    const navigationDisabled = results.length < 2;

    if (previousButton) {
      previousButton.disabled = navigationDisabled;
    }

    if (nextButton) {
      nextButton.disabled = navigationDisabled;
    }

    if (trackNavigation) {
      track("gallery_image_navigate", {
        cake_id: cake.id,

        primary_theme: cake.themes[0] || "",

        primary_occasion: cake.occasions[0] || "",
      });
    }
  }

  function navigateDialog(direction) {
    if (!selectedCake || results.length < 2) {
      return;
    }

    const currentIndex = results.findIndex(
      (cake) => cake.id === selectedCake.id,
    );

    if (currentIndex < 0) {
      return;
    }

    /*
     * Navigation wraps:
     * last → first
     * first → last
     */
    const nextIndex =
      (currentIndex + direction + results.length) % results.length;

    setDialogCake(results[nextIndex], {
      trackNavigation: true,
    });
  }

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-open]");

    if (!button) {
      return;
    }

    const cake = cakes.find((item) => item.id === button.dataset.galleryOpen);

    if (!cake) {
      return;
    }

    previousFocus = button;
    detailScrollY = window.scrollY;

    setDialogCake(cake);

    dialog.showModal();

    document.body.classList.add("dialog-open");

    dialog.querySelector("[data-cake-dialog-close]").focus();

    track("gallery_image_open", {
      cake_id: cake.id,

      primary_theme: cake.themes[0] || "",

      primary_occasion: cake.occasions[0] || "",

      source_page: "gallery",

      position:
        Number(button.closest(".gallery-card").dataset.position || 0) + 1,

      gallery_search_active: Boolean(state.query || state.item),

      gallery_search_type: state.item
        ? state.query
          ? "taxonomy_and_free_form"
          : "taxonomy"
        : state.query
          ? "free_form"
          : "none",

      filter_key: state.item?.key || "",
    });
  });

  function closeGalleryDetail() {
    if (closingDetail || !dialog) {
      return;
    }

    closingDetail = true;

    if (dialog.open) {
      dialog.close();
    }

    document.body.classList.remove("dialog-open");

    dialogImage.removeAttribute("src");

    dialogImage.alt = "";
    dialogCaption.textContent = "";
    dialogContext.textContent = "PureBakes creation";

    delete availability.dataset.cakeId;
    delete availability.dataset.cakeCaption;
    delete availability.dataset.occasion;

    selectedCake = null;

    const focusTarget = previousFocus;

    previousFocus = null;
    closingDetail = false;

    /*
     * Explicitly preserve the Gallery position.
     */
    window.scrollTo(0, detailScrollY);

    focusTarget?.focus({
      preventScroll: true,
    });
  }

  previousButton?.addEventListener("click", () => navigateDialog(-1));

  nextButton?.addEventListener("click", () => navigateDialog(1));

  dialog
    ?.querySelector("[data-cake-dialog-close]")
    .addEventListener("click", closeGalleryDetail);

  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeGalleryDetail();
  });

  /*
   * Clicking the actual dialog backdrop closes it.
   * Clicking image/copy/buttons inside does not.
   */
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeGalleryDetail();
    }
  });

  dialog?.addEventListener("close", () => {
    if (!closingDetail && selectedCake) {
      closeGalleryDetail();
    }
  });

  /*
   * Mobile swipe navigation.
   */
  dialog?.querySelector("[data-cake-dialog-media]")?.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];

      touchStartX = touch.clientX;

      touchStartY = touch.clientY;
    },
    {
      passive: true,
    },
  );

  dialog?.querySelector("[data-cake-dialog-media]")?.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];

      const deltaX = touch.clientX - touchStartX;

      const deltaY = touch.clientY - touchStartY;

      /*
       * Ignore short movements and vertical scrolling.
       */
      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }

      navigateDialog(deltaX < 0 ? 1 : -1);
    },
    {
      passive: true,
    },
  );

  /*
   * Desktop keyboard navigation.
   *
   * Escape remains handled by the native dialog cancel
   * event above.
   *
   * Do not navigate the Gallery underneath the
   * Availability dialog if it is open.
   */
  document.addEventListener("keydown", (event) => {
    if (
      !dialog?.open ||
      document.querySelector("[data-availability-dialog][open]")
    ) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateDialog(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateDialog(1);
    }
  });

  window.addEventListener("popstate", restoreFromUrl);

  restoreFromUrl();
}
