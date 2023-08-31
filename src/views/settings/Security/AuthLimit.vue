<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :has-detail-in-msg="false"
      :submit-method="submitMethod"
      :url="url"
      v-bind="$data"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import IBox from '@/components/IBox/index.vue'
import { BlockedIPs } from '@/components'

export default {
  name: 'EmailContent',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      initial: {
        SECURITY_LOGIN_IP_BLACK_LIST: []
      },
      visible: false,
      fields: [
        [
          this.$t('common.UserLoginLimit'),
          [
            'SECURITY_LOGIN_LIMIT_COUNT',
            'SECURITY_LOGIN_LIMIT_TIME'
          ]
        ],
        [
          this.$t('common.IPLoginLimit'),
          [
            'SECURITY_LOGIN_IP_LIMIT_COUNT',
            'SECURITY_LOGIN_IP_LIMIT_TIME',
            'SECURITY_LOGIN_IP_WHITE_LIST',
            'SECURITY_LOGIN_IP_BLACK_LIST',
            'SECURITY_VIEW_BLOCKED_IPS'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'USER_LOGIN_SINGLE_MACHINE_ENABLED',
            'ONLY_ALLOW_EXIST_USER_AUTH',
            'ONLY_ALLOW_AUTH_FROM_SOURCE'
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
        SECURITY_VIEW_BLOCKED_IPS: {
          component: BlockedIPs,
          label: this.$t('setting.BlockedIPS'),
          el: {
            method: 'push_account_method',
            assets: this.asset_ids,
            nodes: this.node_ids
          },
          helpText: this.$t('setting.ViewBlockedIPSHelpText')
        }
      },
      cleanFormValue(value) {
        const ipBlackList = value.SECURITY_LOGIN_IP_BLACK_LIST
        const ipWhiltList = value.SECURITY_LOGIN_IP_WHITE_LIST
        if (Array.isArray(ipBlackList)) {
          value.SECURITY_LOGIN_IP_BLACK_LIST = ipBlackList.filter(Boolean)
        }
        if (Array.isArray(ipWhiltList)) {
          value.SECURITY_LOGIN_IP_WHITE_LIST = ipWhiltList.filter(Boolean)
        }
        return value
      },
      url: '/api/v1/settings/setting/?category=security_login_limit'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    onConfirm() {
    }
  }
}
</script>

<style scoped>

</style>
