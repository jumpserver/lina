import request from '@/utils/request'

export function getTaskDetail(id) {
  return request({
    url: `/api/v1/ops/tasks/${id}/`,
    method: 'get'
  })
}

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
