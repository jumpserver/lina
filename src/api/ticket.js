import request from '@/utils/request'

export function getPendingTicketsUrl(assign) {
  return `/api/v1/tickets/tickets/?assignees__id=${assign}&state=pending`
}

export function getTicketOpenCount(assign) {
  return request({
    url: getPendingTicketsUrl(assign),
    method: 'get',
    params: { offset: 0, limit: 1 },
    disableFlashErrorMsg: true
  })
}
