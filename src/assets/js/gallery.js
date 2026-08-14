import { filterGallery, findKnown, normalizeSearch, searchText } from "./gallery-discovery-core.js";

const dataElement = document.querySelector("#gallery-data");
const configElement = document.querySelector("#gallery-discovery-data");
const galleryRoot = document.querySelector("[data-gallery]");
if (dataElement && configElement && galleryRoot) {
  const cakes = JSON.parse(dataElement.textContent); const config = JSON.parse(configElement.textContent); const batchSize = 30;
  const grid = galleryRoot.querySelector("[data-gallery-grid]"); const heading = galleryRoot.querySelector("[data-gallery-result-heading]"); const empty = galleryRoot.querySelector("[data-gallery-empty]"); const emptyHeading = galleryRoot.querySelector("[data-gallery-empty-heading]"); const more = galleryRoot.querySelector("[data-gallery-load-more]"); const moreContainer = galleryRoot.querySelector("[data-gallery-more]"); const search = galleryRoot.querySelector("[data-gallery-search]");
  const exploreButton = galleryRoot.querySelector("[data-gallery-explore]"); const explorePanel = galleryRoot.querySelector("[data-gallery-explore-panel]"); const pills = [...galleryRoot.querySelectorAll("[data-gallery-pill]")]; const clearButtons = [...galleryRoot.querySelectorAll("[data-gallery-clear]")];
  const dialog = document.querySelector("[data-cake-dialog]"); const dialogImage = dialog?.querySelector("[data-cake-dialog-image]"); const dialogCaption = dialog?.querySelector("[data-cake-dialog-caption]"); const dialogContext = dialog?.querySelector("[data-cake-dialog-context]"); const availability = dialog?.querySelector("[data-cake-context]");
  let shown = batchSize; let state = { query: "", item: null }; let results = cakes; let previousFocus = null; let selectedCake = null; let closingDetail = false;
  const track = (name, params = {}) => window.PureBakesAnalytics?.trackEvent(name, params);
  const variant = (path, width) => path.replace(/\.webp$/i, `-${width}.webp`);
  const label = (value) => value ? value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Custom design";
  const titleCase = (value) => searchText(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
  const enquiryOccasion = (cake) => {
    const values = cake.occasions || [];
    if (values.includes("anniversary")) return "anniversary";
    if (values.includes("baby-shower")) return "baby_shower";
    if (values.includes("birthday") || values.includes("first-birthday") || values.includes("first-birthday-boy") || values.includes("first-birthday-girl")) return "birthday";
    return "";
  };
  function createCard(cake, position) {
    const article = document.createElement("article"); article.className = "gallery-card"; article.dataset.cakeId = cake.id;
    const button = document.createElement("button"); button.type = "button"; button.dataset.galleryOpen = cake.id; button.dataset.galleryAction = "image_open"; button.dataset.cakeId = cake.id; button.setAttribute("aria-label", `View ${cake.caption}`);
    const image = document.createElement("img"); image.className = "portfolio-cake-photo"; image.src = variant(cake.image, 360); image.srcset = `${variant(cake.image, 360)} 360w, ${variant(cake.image, 720)} 720w`; image.sizes = "(max-width: 47.99rem) calc(50vw - 1.2rem), (max-width: 74.99rem) calc(33.333vw - 1.5rem), calc(20vw - 1.5rem)"; image.width = 1080; image.height = 1920; image.alt = cake.alt; image.loading = "lazy"; image.decoding = "async";
    const copy = document.createElement("span"); const small = document.createElement("small"); small.textContent = label(cake.occasions[0]); const strong = document.createElement("strong"); strong.textContent = cake.caption; copy.append(small, strong); button.append(image, copy); article.append(button); article.dataset.position = position; return article;
  }
  function resultText() { if (!state.query) return `${results.length} cake designs`; if (state.item) return `${results.length} ${state.item.label} cake designs`; return `${results.length} results for “${search.value.trim()}”`; }
  function render() {
    grid.replaceChildren(...results.slice(0, shown).map(createCard)); heading.textContent = resultText();
    empty.hidden = results.length !== 0; grid.hidden = results.length === 0; moreContainer.hidden = results.length === 0 || results.length <= shown;
    clearButtons.forEach((button) => { button.hidden = !state.query; });
    emptyHeading.textContent = state.query ? `No cake designs found for “${search.value.trim()}”.` : "No matching cake designs found.";
  }
  function syncControls() {
    pills.forEach((pill) => pill.setAttribute("aria-pressed", String(state.item ? pill.dataset.filterKey === state.item.key : pill.dataset.filterKey === "all")));
    exploreButton.classList.toggle("is-active", Boolean(state.item));
  }
  function updateUrl({ replace = false } = {}) {
    const url = new URL(window.location.href); if (state.query) url.searchParams.set("search", state.query); else url.searchParams.delete("search");
    window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function apply({ updateHistory = false, replaceHistory = false } = {}) {
    results = filterGallery(cakes, state); shown = batchSize; syncControls(); render(); if (updateHistory) updateUrl({ replace: replaceHistory });
  }
  function restoreFromUrl() {
    const raw = new URL(window.location.href).searchParams.get("search") || ""; const query = normalizeSearch(raw); const item = findKnown(config, query);
    state = { query, item }; search.value = item?.label || (query ? titleCase(query) : ""); apply();
  }
  function reset({ updateHistory = true } = {}) { state = { query: "", item: null }; search.value = ""; apply({ updateHistory }); }
  exploreButton.addEventListener("click", () => { const open = exploreButton.getAttribute("aria-expanded") !== "true"; exploreButton.setAttribute("aria-expanded", String(open)); explorePanel.hidden = !open; });
  pills.forEach((pill) => pill.addEventListener("click", () => {
    if (pill.dataset.filterKey === "all") { reset(); }
    else {
      const item = findKnown(config, pill.dataset.filterKey); state = { query: item.key, item }; search.value = item.label; apply({ updateHistory: true });
      track("gallery_filter", { filter_type: item.field === "themes" ? "theme" : "occasion", filter_key: item.key, result_count: results.length });
    }
    if (matchMedia("(max-width: 47.99rem)").matches) { explorePanel.hidden = true; exploreButton.setAttribute("aria-expanded", "false"); }
  }));
  galleryRoot.querySelector("[data-gallery-search-form]").addEventListener("submit", (event) => {
    event.preventDefault(); const display = search.value.trim().slice(0, 100); const query = normalizeSearch(display); state = { query, item: null }; search.value = display; apply({ updateHistory: true });
    if (query) { track("gallery_search", { search_term: query, result_count: results.length }); if (!results.length) track("gallery_search_no_results", { search_term: query }); }
  });
  clearButtons.forEach((button) => button.addEventListener("click", () => reset()));
  more.addEventListener("click", () => {
    const previousShown = Math.min(shown, results.length); shown += batchSize; render();
    track("gallery_load_more", { visible_count: Math.min(shown, results.length), result_count: results.length });
    if (moreContainer.hidden) grid.querySelectorAll("[data-gallery-open]")[previousShown]?.focus(); else more.focus();
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-open]"); if (!button) return; const cake = cakes.find((item) => item.id === button.dataset.galleryOpen); if (!cake) return;
    previousFocus = button; selectedCake = cake; dialogImage.src = cake.image; dialogImage.alt = cake.alt; dialogCaption.textContent = cake.caption; dialogContext.textContent = label(cake.occasions[0]); availability.dataset.cakeId = cake.id; availability.dataset.cakeCaption = cake.caption; const occasion = enquiryOccasion(cake); if (occasion) availability.dataset.occasion = occasion; else delete availability.dataset.occasion; dialog.showModal(); document.body.classList.add("dialog-open"); dialog.querySelector("[data-cake-dialog-close]").focus();
    track("gallery_image_open", { cake_id: cake.id, primary_theme: cake.themes[0] || "", primary_occasion: cake.occasions[0] || "", source_page: "gallery", position: Number(button.closest(".gallery-card").dataset.position || 0) + 1, gallery_query: state.query });
  });
  function closeGalleryDetail() {
    if (closingDetail || !dialog) return; closingDetail = true; if (dialog.open) dialog.close();
    document.body.classList.remove("dialog-open"); dialogImage.removeAttribute("src"); dialogImage.alt = ""; dialogCaption.textContent = ""; dialogContext.textContent = "PureBakes creation"; delete availability.dataset.cakeId; delete availability.dataset.cakeCaption; selectedCake = null;
    delete availability.dataset.occasion; const focusTarget = previousFocus; previousFocus = null; closingDetail = false; focusTarget?.focus();
  }
  dialog?.querySelector("[data-cake-dialog-close]").addEventListener("click", closeGalleryDetail);
  dialog?.addEventListener("cancel", (event) => { event.preventDefault(); closeGalleryDetail(); });
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) closeGalleryDetail(); });
  dialog?.addEventListener("close", () => { if (!closingDetail && selectedCake) closeGalleryDetail(); });
  window.addEventListener("popstate", restoreFromUrl);
  restoreFromUrl();
}
