export const attachmentAccept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'

export function attachmentSelectionError(files) {
  if (files.length > 5) return 'TicketAttachmentCountError'
  for (const file of files) {
    if (!/\.(jpe?g|png|pdf|docx?|xlsx?)$/i.test(file.name)) return 'TicketAttachmentTypeError'
    if (!file.size || file.size > 10 * 1024 * 1024) return 'TicketAttachmentSizeError'
  }
  return ''
}

export function ticketSubmitData(payload, files = []) {
  if (!files.length) return payload
  const data = new FormData()
  for (const [name, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      data.append(name, typeof value === 'object' ? JSON.stringify(value) : value)
    }
  }
  for (const file of files) data.append('attachments', file, file.name)
  return data
}
