import request from '@/utils/request'

export function postInterface(formData) {
  return request({
    url: '/api/v1/xpack/interface/setting',
    method: 'put',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}
export function getInterfaceInfo() {
  return request({
    url: '/api/v1/xpack/interface/setting',
    method: 'get'
  })
}

export function restoreInterface() {
  return request({
    url: '/xpack/interface/restore/default',
    method: 'get'
  })
}
