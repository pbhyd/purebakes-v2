const root = document.documentElement;
const pageContext = { page_type: root.dataset.pageType || "page", page_slug: root.dataset.pageSlug || "", classification: root.dataset.pageClassification || "" };
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
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open)); mobileMenu.hidden = open;
  });
  mobileMenu.addEventListener("click", (event) => { if (event.target.closest("a")) { mobileMenu.hidden = true; menuButton.setAttribute("aria-expanded", "false"); } });
}

const dialog = document.querySelector("[data-availability-dialog]");
const dateInput = document.querySelector("#cake-date");
let availabilityContext = {};
if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);
document.querySelectorAll("[data-availability-open]").forEach((button) => button.addEventListener("click", () => {
  availabilityContext = { cake_id: button.dataset.cakeId || "", cake_caption: button.dataset.cakeCaption || "", page_context: button.dataset.pageContext || "" };
  const galleryQuery = sessionStorage.getItem("purebakes_gallery_query") || "";
  dialog?.showModal(); trackEvent("check_availability_open", { cta_location: button.dataset.ctaLocation || "unknown", cake_id: availabilityContext.cake_id, gallery_query: galleryQuery }); setTimeout(() => dateInput?.focus(), 50);
}));
document.querySelector("[data-availability-close]")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector("[data-availability-form]")?.addEventListener("submit", (event) => {
  event.preventDefault(); const error = document.querySelector("[data-date-error]");
  if (!dateInput?.value) { error.textContent = "Please choose the date you need your cake."; trackEvent("availability_date_validation_error"); dateInput?.focus(); return; }
  error.textContent = "";
  const readableDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${dateInput.value}T12:00:00`));
  const reference = `${location.origin}${location.pathname}`;
  const design = availabilityContext.cake_caption ? `\n\nDesign:\n${availabilityContext.cake_caption}` : "";
  const context = availabilityContext.page_context ? ` for ${availabilityContext.page_context}` : "";
  const message = `Hi PureBakes! ${availabilityContext.cake_caption ? "I'm interested in this cake design." : `I'm looking for a custom cake${context}.`}\n\nDate needed: ${readableDate}${design}\n\nReference: ${reference}`;
  trackEvent("check_availability_continue", { lead_time_bucket: getLeadTimeBucket(dateInput.value), cake_id: availabilityContext.cake_id, gallery_query: sessionStorage.getItem("purebakes_gallery_query") || "" });
  trackEvent("whatsapp_click", { cta_location: "availability_dialog", cake_id: availabilityContext.cake_id, gallery_query: sessionStorage.getItem("purebakes_gallery_query") || "", taxonomy_key: pageContext.page_slug, location: pageContext.page_type === "location" ? pageContext.page_slug : "", classification: pageContext.classification });
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
