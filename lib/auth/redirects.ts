export function safeInternalRedirect(value: unknown, fallback = "/workspace") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && value.length <= 1_024
    ? value
    : fallback;
}
