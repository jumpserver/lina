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
      visible: false,
      fields: [
        'SECURITY_LOGIN_LIMIT_COUNT', 'SECURITY_LOGIN_LIMIT_TIME', 'LOGIN_CONFIRM_ENABLE',
        'USER_LOGIN_SINGLE_MACHINE_ENABLED', 'ONLY_ALLOW_EXIST_USER_AUTH',
        'ONLY_ALLOW_AUTH_FROM_SOURCE'
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
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
