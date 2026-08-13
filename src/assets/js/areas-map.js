const mapElement = document.querySelector("[data-area-map]");
const dataElement = document.querySelector("#service-area-data");
const track = (name, params = {}) => window.PureBakesAnalytics?.trackEvent(name, params);

if (mapElement && dataElement) {
  const locations = JSON.parse(dataElement.textContent);
  let initialized = false;
  const fallback = mapElement.querySelector("[data-map-fallback]");

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const popup = (location) => {
    const name = escapeHtml(location.name); const url = escapeHtml(location.url); const slug = escapeHtml(location.key); const classification = escapeHtml(location.classification);
    return `<div class="area-popup"><strong>${name}</strong><p>Custom cakes for celebrations in ${name}.</p><a href="${url}" data-map-page-link data-location-slug="${slug}" data-location-name="${name}" data-location-classification="${classification}">Explore ${name}</a></div>`;
  };

  function initialize() {
    if (initialized) return; initialized = true; fallback.textContent = "Loading interactive map…";
    try {
      if (!window.L || locations.length !== 41) throw new Error("Map resources unavailable");
      const map = window.L.map(mapElement, { scrollWheelZoom: false, tap: true, zoomControl: true, attributionControl: true });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors' }).addTo(map);
      const serviceIcon = window.L.divIcon({ className: "", html: '<span class="service-pin" aria-hidden="true"></span>', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -8] });
      const bounds = [];
      locations.forEach((location) => {
        const lat = location.key === "puppalaguda" ? location.lat - .003 : location.lat;
        const lng = location.key === "puppalaguda" ? location.lng + .003 : location.lng;
        const marker = window.L.marker([lat, lng], { icon: serviceIcon, title: `${location.name} — Area We Serve`, alt: location.name, keyboard: true }).addTo(map).bindPopup(popup(location), { maxWidth: 260 });
        marker.on("click", () => track("service_area_pin_click", { location_slug: location.key, location_name: location.name, classification: location.classification }));
        bounds.push([lat, lng]);
      });
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
      mapElement.classList.add("is-ready");
      mapElement.addEventListener("click", (event) => { const link = event.target.closest("[data-map-page-link]"); if (link) track("service_area_page_click", { location_slug: link.dataset.locationSlug, location_name: link.dataset.locationName, classification: link.dataset.locationClassification, source: "map_popup" }); });
      track("service_area_map_loaded", { location_count: locations.length });
    } catch (error) {
      initialized = false; fallback.textContent = "The interactive map is unavailable. Explore the areas we serve below.";
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); initialize(); } }, { rootMargin: "300px 0px" });
    observer.observe(mapElement);
  } else initialize();

  document.querySelector(".areas-list")?.addEventListener("click", (event) => { const link = event.target.closest("[data-area-page-link]"); if (link) track("service_area_page_click", { location_slug: link.dataset.locationSlug, location_name: link.dataset.locationName, classification: link.dataset.locationClassification, source: "location_list" }); });
}
