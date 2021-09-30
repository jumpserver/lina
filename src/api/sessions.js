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

export function getAllCommandStorage() {
  return request({
    url: `/api/v1/terminal/command-storages/`,
    method: 'get'
  })
}

export function getAllReplayStorage() {
  return request({
    url: `/api/v1/terminal/replay-storages/`,
    method: 'get'
  })
}

export function TestCommandStorage(id) {
  return request({
    url: `/api/v1/terminal/command-storages/${id}/test-connective/`,
    method: 'get'
  })
}

export function TestReplayStorage(id) {
  return request({
    url: `/api/v1/terminal/replay-storages/${id}/test-connective/`,
    method: 'get'
  })
}

function SetToDefaultStorage(url) {
  return request({
    url: url,
    method: 'patch',
    data: { 'is_default': true }
  })
}

export function SetToDefaultCommandStorage(id) {
  return SetToDefaultStorage(
    `/api/v1/terminal/command-storages/${id}/`,
  )
}

export function SetToDefaultReplayStorage(id) {
  return SetToDefaultStorage(
    `/api/v1/terminal/replay-storages/${id}/`,
  )
}

export function getReplayStorage(id) {
  return request({
    url: `/api/v1/terminal/replay-storages/${id}/`,
    method: 'get'
  })
}

export function getCommandStorage(id) {
  return request({
    url: `/api/v1/terminal/command-storages/${id}/`,
    method: 'get'
  })
}
