export function buildRequestPayload(plugin, values) {
  const request_data = {}
  for (const field of plugin.fields) {
    let value = values[`param_${field.name}`]
    if (field.type === 'list') {
      value = Array.isArray(value)
        ? value
        : String(value || '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
    }
    if (value !== undefined && (field.required || value !== '')) request_data[field.name] = value
  }
  return {
    type: plugin.type,
    title: values.title,
    org_id: values.org_id,
    workflow_id: values.workflow_id,
    comment: values.comment || '',
    request_data
  }
}
