export const normalizeSearch = (value = "") =>
  value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export const searchText = (value = "") =>
  value.replaceAll("-", " ").trim().slice(0, 100);

export const knownItems = (config) =>
  [...config.occasions, ...config.themes].filter((item) => item.key !== "all");

export const findKnown = (config, key) =>
  knownItems(config).find((item) => item.key === key) || null;

export function filterGallery(records, state) {
  const term = searchText(state.query).toLowerCase();

  return records.filter((cake) => {
    if (
      state.item &&
      !(cake[state.item.field] || []).includes(state.item.value)
    ) {
      return false;
    }

    if (!term) return true;

    return [
      cake.caption,
      cake.alt,
      ...cake.themes,
      ...cake.occasions,
      ...cake.styles,
      ...cake.keywords,
      ...cake.flavours,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
}
