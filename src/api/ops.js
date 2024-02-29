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

export function renameFile(playbookId, node) {
  return request({
    url: `/api/v1/ops/playbook/${playbookId}/file/`,
    method: 'patch',
    data: node
  })
}

export function createJob(form) {
  return request({
    url: '/api/v1/ops/jobs/',
    method: 'post',
    data: form
  })
}

export function StopJob(form) {
  return request({
    url: '/api/v1/ops/job-executions/stop/',
    method: 'post',
    data: form
  })
}

export function JobUploadFile(form) {
  return request({
    url: '/api/v1/ops/jobs/upload/',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60 * 60 * 1000,
    data: form
  })
}

