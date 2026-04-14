import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common/index'
import request from '@/utils/request'
import { message } from '@/utils/vue/message'

export function openJDMC(path) {
  return request({
    url: '/api/v1/xpack/jdmc/sso-token/',
    method: 'get',
    disableFlashErrorMsg: true
  }).then(response => {
    const token = response.token
    let url = `${BASE_URL}/jdmc/api/v1/auth/tokens?token=${token}&next=${path}`
    if (process.env.NODE_ENV !== 'production') {
      url = url.replace('9528', '9898')
    }
    window.open(url, '_blank')
  }).catch(error => {
    if (error?.response?.status === 403) {
      message.error(error?.message || i18n.t('BadRoleErrorMsg'))
      return
    }
    message.error(error?.message || i18n.t('BadRequestErrorMsg'))
  })
}
