export function normalizeBasePath(value = "") {
  return value && value !== "/" ? `/${value.replace(/^\/+|\/+$/g, "")}` : "";
}

export function createPublicUrl(basePath = "") {
  return (value = "") => {
    if (
      !basePath ||
      typeof value !== "string" ||
      !value.startsWith("/") ||
      value.startsWith("//") ||
      value === basePath ||
      value.startsWith(`${basePath}/`)
    )
      return value;
    return `${basePath}${value}`;
  };
}
