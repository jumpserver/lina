import request from '@/utils/request'

export function terminateSession(data) {
  return request({
    url: '/api/v1/terminal/tasks/kill-session/',
    method: 'post',
    data: data
  })
}

export function getSessionDetail(id) {
  return request({
    url: `/api/v1/terminal/sessions/${id}/`,
    method: 'get'
  })
}

export function getSessionCommands(id) {
  return request({
    url: `/api/v1/terminal/commands/?session_id=${id}`,
    method: 'get'
  })
}

export function getTerminalDetail(id) {
  return request({
    url: `/api/v1/terminal/terminals/${id}/`,
    method: 'get'
  })
}
