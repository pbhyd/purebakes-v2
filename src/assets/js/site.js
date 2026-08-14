import { normalizeSearch } from "./gallery-discovery-core.js";

const root = document.documentElement;
const pageContext = { page_type: root.dataset.pageType || "page", page_slug: root.dataset.pageSlug || "", page_path: window.location.pathname, classification: root.dataset.pageClassification || "" };
const sanitize = (parameters) => Object.fromEntries(Object.entries(parameters).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => [key.slice(0, 40), typeof value === "string" ? value.slice(0, 100) : value]));

export function trackEvent(eventName, parameters = {}) {
  const safeName = String(eventName).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
  const payload = sanitize({ ...pageContext, ...parameters });
  try {
    if (typeof window.gtag === "function") window.gtag("event", safeName, payload);
    if (typeof window.clarity === "function" && ["whatsapp_click", "check_availability_continue", "phone_click", "google_maps_click", "google_reviews_click"].includes(safeName)) window.clarity("event", safeName);
  } catch { /* Analytics must never interrupt an enquiry. */ }
}
window.PureBakesAnalytics = { trackEvent };

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");
if (menuButton && mobileMenu) {
  const mobileGroups = [...mobileMenu.querySelectorAll(".mobile-nav-group")];
  let mobileScrollY = 0;
  const closeMobileGroups = (except) => mobileGroups.forEach((group) => {
    if (group === except) return;
    const button = group.querySelector("button"); const panel = group.querySelector("div");
    button.setAttribute("aria-expanded", "false"); panel.hidden = true;
  });
  const setMobileMenuOpen = (open, restoreFocus = false) => {
    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (open === wasOpen) return;
    menuButton.setAttribute("aria-expanded", String(open)); menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu"); mobileMenu.hidden = !open; root.classList.toggle("mobile-menu-open", open);
    if (open) {
      mobileScrollY = window.scrollY; document.body.style.position = "fixed"; document.body.style.top = `-${mobileScrollY}px`; document.body.style.width = "100%"; menuButton.focus();
    } else {
      document.body.style.position = ""; document.body.style.top = ""; document.body.style.width = ""; window.scrollTo(0, mobileScrollY); if (restoreFocus) menuButton.focus();
    }
    if (!open) closeMobileGroups();
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    setMobileMenuOpen(!open);
  });
  mobileGroups.forEach((group) => group.querySelector("button").addEventListener("click", () => {
    const button = group.querySelector("button"); const panel = group.querySelector("div"); const open = button.getAttribute("aria-expanded") === "true";
    closeMobileGroups(group); button.setAttribute("aria-expanded", String(!open)); panel.hidden = open;
  }));
  mobileMenu.addEventListener("click", (event) => { if (event.target.closest("a")) setMobileMenuOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (menuButton.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") { event.preventDefault(); setMobileMenuOpen(false, true); return; }
    if (event.key !== "Tab" || dialog?.open) return;
    const focusable = [menuButton, ...mobileMenu.querySelectorAll('a[href], button:not([disabled])')].filter((item) => item.getClientRects().length);
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

const desktopCakesMenu = document.querySelector("[data-desktop-cakes-menu]");
if (desktopCakesMenu) {
  const toggle = desktopCakesMenu.querySelector(".desktop-cakes-toggle"); const panel = desktopCakesMenu.querySelector(".cakes-mega-menu");
  const setDesktopCakesOpen = (open) => { toggle.setAttribute("aria-expanded", String(open)); panel.setAttribute("aria-hidden", String(!open)); desktopCakesMenu.classList.toggle("is-open", open); };
  toggle.addEventListener("click", () => setDesktopCakesOpen(toggle.getAttribute("aria-expanded") !== "true"));
  desktopCakesMenu.addEventListener("mouseenter", () => setDesktopCakesOpen(true));
  desktopCakesMenu.addEventListener("mouseleave", () => { if (!desktopCakesMenu.contains(document.activeElement)) setDesktopCakesOpen(false); });
  desktopCakesMenu.addEventListener("focusout", (event) => { if (!desktopCakesMenu.contains(event.relatedTarget)) setDesktopCakesOpen(false); });
  document.addEventListener("click", (event) => { if (!desktopCakesMenu.contains(event.target)) setDesktopCakesOpen(false); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setDesktopCakesOpen(false); toggle.focus(); } });
}

const dialog = document.querySelector("[data-availability-dialog]");
const dateInput = document.querySelector("#cake-date");
const occasionInputs = [...document.querySelectorAll('input[name="cake-occasion"]')];
let availabilityContext = {};
const occasionLabels = { birthday: "Birthday", anniversary: "Anniversary", engagement: "Engagement", wedding: "Wedding", baby_shower: "Baby Shower", other: "Other" };
const pageOccasions = { birthday: "birthday", "first-birthday-boys": "birthday", "first-birthday-girls": "birthday", anniversary: "anniversary", engagement: "engagement", wedding: "wedding", "baby-shower": "baby_shower" };
function getLocalToday(date = new Date()) {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function refreshDateMinimum() {
  if (!dateInput) return;
  const localToday = getLocalToday(); dateInput.min = localToday;
  if (dateInput.value && dateInput.value < localToday) dateInput.value = "";
}
function createEnquiryId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().split("-")[0];
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
function getGalleryQuery() {
  if (pageContext.page_type !== "gallery") return "";
  return normalizeSearch(new URL(window.location.href).searchParams.get("search") || "");
}
function getAvailabilityAttribution() {
  return { cta_location: availabilityContext.cta_location || "unknown", page_context: availabilityContext.page_context || "", gallery_query: availabilityContext.gallery_query || "", enquiry_id: availabilityContext.enquiry_id || "" };
}
function getSelectedOccasion() { return occasionInputs.find((input) => input.checked)?.value || ""; }
function getPreselectedOccasion(button) {
  if (Object.hasOwn(occasionLabels, button.dataset.occasion || "")) return button.dataset.occasion;
  return pageContext.page_type === "occasion" ? pageOccasions[pageContext.page_slug] || "" : "";
}
refreshDateMinimum();
document.querySelectorAll("[data-availability-open]").forEach((button) => button.addEventListener("click", () => {
  occasionInputs.forEach((input) => { input.checked = false; });
  const preselectedOccasion = getPreselectedOccasion(button); const selectedInput = occasionInputs.find((input) => input.value === preselectedOccasion); if (selectedInput) selectedInput.checked = true;
  document.querySelector("[data-occasion-error]").textContent = ""; document.querySelector("[data-date-error]").textContent = "";
  availabilityContext = { cake_id: button.dataset.cakeId || "", cake_caption: button.dataset.cakeCaption || "", page_context: button.dataset.pageContext || "", cta_location: button.dataset.ctaLocation || "unknown", gallery_query: getGalleryQuery(), enquiry_id: createEnquiryId(), preselected_occasion: preselectedOccasion };
  const openParameters = { ...getAvailabilityAttribution(), cake_id: availabilityContext.cake_id }; if (preselectedOccasion) openParameters.occasion = preselectedOccasion;
  refreshDateMinimum(); dialog?.showModal(); trackEvent("check_availability_open", openParameters); setTimeout(() => (selectedInput || occasionInputs[0])?.focus(), 50);
}));
document.querySelector("[data-availability-close]")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  const clickedOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (clickedOutside) dialog.close();
});
document.querySelector("[data-availability-form]")?.addEventListener("submit", (event) => {
  event.preventDefault(); const occasionError = document.querySelector("[data-occasion-error]"); const error = document.querySelector("[data-date-error]"); const occasion = getSelectedOccasion();
  if (!occasion) { occasionError.textContent = "Please select an occasion."; occasionInputs[0]?.focus(); return; }
  occasionError.textContent = "";
  if (!dateInput?.value) { error.textContent = "Please choose the date you need your cake."; trackEvent("availability_date_validation_error"); dateInput?.focus(); return; }
  if (dateInput.value < getLocalToday()) { error.textContent = "Please select today or a future date."; trackEvent("availability_date_validation_error"); dateInput.focus(); return; }
  error.textContent = "";
  const readableDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${dateInput.value}T12:00:00`));
  const reference = document.querySelector('link[rel="canonical"]')?.href || `https://purebakes.in${location.pathname}`;
  const design = availabilityContext.cake_caption ? `\n\nDesign:\n${availabilityContext.cake_caption}` : "";
  const context = availabilityContext.page_context ? ` for ${availabilityContext.page_context}` : "";
  const message = `Hi PureBakes, I'd like to enquire about a custom cake${context}.\n\nOccasion: ${occasionLabels[occasion]}\nDate: ${readableDate}${design}\n\nReference: ${reference}`;
  trackEvent("check_availability_continue", { ...getAvailabilityAttribution(), occasion, lead_time_bucket: getLeadTimeBucket(dateInput.value), cake_id: availabilityContext.cake_id });
  trackEvent("whatsapp_click", { ...getAvailabilityAttribution(), occasion, cake_id: availabilityContext.cake_id, taxonomy_key: pageContext.page_slug, location: pageContext.page_type === "location" ? pageContext.page_slug : "", classification: pageContext.classification });
  dialog.close(); window.open(`https://wa.me/919980213333?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
function getLeadTimeBucket(value) { const days = Math.ceil((new Date(`${value}T12:00:00`) - new Date()) / 86400000); return days <= 3 ? "0_3_days" : days <= 7 ? "4_7_days" : days <= 14 ? "8_14_days" : "15_plus_days"; }

document.querySelectorAll("[data-whatsapp]").forEach((link) => link.addEventListener("click", () => trackEvent("whatsapp_click", { cta_location: link.dataset.ctaLocation || "unknown" })));
document.querySelectorAll("[data-track]").forEach((link) => link.addEventListener("click", () => trackEvent(link.dataset.track, { link_location: link.closest("footer") ? "footer" : "content" })));
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-gallery-action]"); if (!target) return;
  const action = target.dataset.galleryAction;
  const eventNames = { search: "gallery_search", filter: "gallery_filter", image_open: "gallery_image_open", load_more: "gallery_load_more" };
  if (eventNames[action]) trackEvent(eventNames[action], sanitize({ cake_id: target.dataset.cakeId || "", filter_type: target.dataset.filterType || "", filter_value: target.dataset.filterValue || "" }));
});
if (["theme", "occasion", "location"].includes(pageContext.page_type)) trackEvent(`${pageContext.page_type}_page_view`, { taxonomy_key: pageContext.page_slug, location: pageContext.page_type === "location" ? pageContext.page_slug : "", classification: pageContext.classification });
const scrollTop = document.querySelector("[data-scroll-top]");
window.addEventListener("scroll", () => { if (scrollTop) scrollTop.hidden = window.scrollY < 700; }, { passive: true });
scrollTop?.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); trackEvent("scroll_to_top"); });
