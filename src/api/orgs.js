import request from '@/utils/request'

export function getOrgDetail(oid) {
  return request({
    url: `/api/v1/orgs/orgs/current/?oid=${oid}`,
    method: 'get'
  })
}

export function getCurrentOrg() {
  return request({
    url: `/api/v1/orgs/orgs/current/`,
    method: 'get'
  })
}

export default {
  getCurrentOrg,
  getOrgDetail
}

