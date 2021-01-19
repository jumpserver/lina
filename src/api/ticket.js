import request from '@/utils/request'

export function getTicketOpenCount(assign) {
  return request({
    url: `/api/v1/tickets/tickets/?assignees__id=${assign}&status=open&offset=0&limit=15&display=1&draw=1/`,
    method: 'get'
  })
}
