// Browsers use different messages when a lazy-loaded page cannot be fetched.
const PAGE_LOAD_ERROR_RE =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading (?:CSS )?chunk [\s\S]+ failed/i

export function isPageLoadError(error) {
  const message = typeof error === 'string' ? error : error?.message
  return typeof message === 'string' && PAGE_LOAD_ERROR_RE.test(message)
}
