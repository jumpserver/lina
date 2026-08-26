import request from '@/utils/request'

const SETTINGS_URL = '/api/v1/settings/setting/?category=chat'

export function getChatAISettings() {
  return request({
    url: SETTINGS_URL,
    method: 'get'
  })
}

export function saveChatAISettings(data) {
  return request({
    url: SETTINGS_URL,
    method: 'patch',
    data
  })
}

export function discoverChatAIModels(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/chatai/models/',
    method: 'post',
    data
  })
}

export function testChatAISettings(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/chatai/testing/',
    method: 'post',
    data
  })
}
