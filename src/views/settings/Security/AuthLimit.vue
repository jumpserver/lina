<template>
  <div>
    <el-button size="mini" type="primary" @click="visible = !visible">
      {{ $t('setting.Setting') }}
    </el-button>
    <Dialog
      :title="$t('setting.AuthLimit')"
      :visible.sync="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      top="10%"
      @confirm="onConfirm()"
    >
      <GenericCreateUpdateForm
        v-bind="$data"
        :fields="fields"
        :url="url"
        :fields-meta="fieldsMeta"
        :submit-method="submitMethod"
        :has-detail-in-msg="false"
      />
    </Dialog>
  </div>

</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { Dialog } from '@/components'

export default {
  name: 'EmailContent',
  components: {
    GenericCreateUpdateForm,
    Dialog
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
            'SECURITY_LOGIN_IP_BLACK_LIST'
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
      },
      afterGetFormValue(validValues) {
        validValues.SECURITY_LOGIN_IP_BLACK_LIST = validValues.SECURITY_LOGIN_IP_BLACK_LIST.toString()
        validValues.SECURITY_LOGIN_IP_WHITE_LIST = validValues.SECURITY_LOGIN_IP_WHITE_LIST.toString()
        return validValues
      },
      cleanFormValue(value) {
        const ipBlackList = value.SECURITY_LOGIN_IP_BLACK_LIST
        const ipWhiltList = value.SECURITY_LOGIN_IP_WHITE_LIST
        if (!Array.isArray(ipBlackList)) {
          value.SECURITY_LOGIN_IP_BLACK_LIST = ipBlackList ? ipBlackList.split(',') : []
        }
        if (!Array.isArray(ipWhiltList)) {
          value.SECURITY_LOGIN_IP_WHITE_LIST = ipWhiltList ? ipWhiltList.split(',') : []
        }
        return value
      },
      url: '/api/v1/settings/setting/?category=security'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    onConfirm() {}
  }
}
</script>

<style scoped>

</style>
