export function getRelationIds(items) {
  return (items || []).map((item) => item.value || item.id || item)
}
