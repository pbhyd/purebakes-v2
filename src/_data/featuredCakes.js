import gallery from "./gallery.js";
export default gallery
  .filter((cake) => cake.featured)
  .map((cake) => ({
    ...cake,
    small: cake.image.replace(/\.webp$/i, "-360.webp"),
    medium: cake.image.replace(/\.webp$/i, "-720.webp"),
    width: 600,
    height: 760,
    occasion: cake.occasions[0]
      ? cake.occasions[0].replaceAll("-", " ")
      : "Custom cake",
  }));
