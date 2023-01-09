import request from '@/utils/request'

export function getAdhocDetail(id) {
  return request({
    url: `/api/v1/ops/adhoc/${id}/`,
    method: 'get'
  })
}

export function getHistoryExecutionDetail(id) {
  return request({
    url: `/api/v1/ops/adhoc-executions/${id}/`,
    method: 'get'
  })
}

export function getTaskDetail(id) {
  return request({
    url: `/api/v1/ops/job-execution/task-detail/${id}/`,
    method: 'get'
  })
}

export function getJob(id) {
  return request({
    url: `/api/v1/ops/jobs/${id}/`,
    method: 'get'
  })
}

export function uploadPlaybook(form) {
  return request({
    url: '/api/v1/ops/playbooks/',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: form
  })
}
