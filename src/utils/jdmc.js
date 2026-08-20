import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common/index'
import request from '@/utils/request'
import { message } from '@/utils/vue/message'

export function openJDMC(path) {
  const targetWindow = window.open('', '_blank')

  return request({
    url: '/api/v1/common/jdmc/sso-token/',
    method: 'get',
    disableFlashErrorMsg: true
  })
    .then((response) => {
      const params = new URLSearchParams({
        token: response.token,
        next: path
      })
      let url = `${BASE_URL}/jdmc/api/v1/auth/tokens?${params.toString()}`
      if (process.env.NODE_ENV !== 'production') {
        url = url.replace('9528', '9898')
      }

      if (targetWindow) {
        targetWindow.location.replace(url)
      } else {
        window.open(url, '_blank')
      }
    })
    .catch((error) => {
      targetWindow?.close()
      if (error?.response?.status === 403) {
        message.error(error?.message || i18n.t('BadRoleErrorMsg'))
        return
      }
      message.error(error?.message || i18n.t('BadRequestErrorMsg'))
    })
}
