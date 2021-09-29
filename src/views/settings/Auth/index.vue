<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox'
import CAS from './CAS'
import OIDC from './OIDC'
import Radius from './Radius'
import DingTalk from './DingTalk'
import FeiShu from './FeiShu'
import WeCom from './WeCom'
import SSO from './SSO'

export default {
  name: 'Auth',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=auth',
      fields: [
        [
          this.$t('setting.AuthMethod'), [
            'AUTH_CAS', 'AUTH_OPENID',
            'AUTH_WECOM', 'AUTH_DINGTALK', 'AUTH_FEISHU',
            'AUTH_RADIUS', 'AUTH_SSO'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'FORGOT_PASSWORD_URL', // 'HEALTH_CHECK_TOKEN',
            'LOGIN_REDIRECT_MSG_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_CAS: {
          component: CAS
        },
        AUTH_OPENID: {
          component: OIDC
        },
        AUTH_RADIUS: {
          component: Radius
        },
        AUTH_WECOM: {
          component: WeCom
        },
        AUTH_DINGTALK: {
          component: DingTalk
        },
        AUTH_FEISHU: {
          component: FeiShu
        },
        AUTH_SSO: {
          component: SSO
        },
        FORGOT_PASSWORD_URL: {
          on: {
            change([value], updateForm) {
              if (value && !value.startsWith('http')) {
                updateForm({ FORGOT_PASSWORD_URL: 'http://' + value })
              }
            }
          }
        }
      },
      submitMethod() {
        return 'patch'
      },
      cleanFormValue(data) {
        // 这个页面不去提交auth这些
        const removeFields = [
          'AUTH_CAS', 'AUTH_OPENID', 'AUTH_WECOM', 'AUTH_DINGTALK',
          'AUTH_FEISHU', 'AUTH_RADIUS', 'AUTH_SSO'
        ]
        for (const i of removeFields) {
          delete data[i]
        }
        return data
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
