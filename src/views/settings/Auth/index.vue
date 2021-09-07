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

export default {
  name: 'Auth',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=auth',
      defaultButton: false,
      fields: [
        [
          '集中认证', ['AUTH_CAS', 'AUTH_OPENID']
        ],
        [
          'APP 认证', ['AUTH_WECOM', 'AUTH_DINGTALK', 'AUTH_FEISHU']
        ],
        [
          '其它认证', ['AUTH_RADIUS']
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
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
