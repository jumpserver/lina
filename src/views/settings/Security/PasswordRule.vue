<template>
  <div>
    <el-button size="mini" type="primary" @click="visible = !visible">
      {{ $t('setting.Setting') }}
    </el-button>
    <Dialog
      :title="$t('setting.PasswordCheckRule')"
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
        'SECURITY_PASSWORD_MIN_LENGTH', 'SECURITY_ADMIN_USER_PASSWORD_MIN_LENGTH', 'SECURITY_PASSWORD_UPPER_CASE',
        'SECURITY_PASSWORD_LOWER_CASE', 'SECURITY_PASSWORD_NUMBER', 'SECURITY_PASSWORD_SPECIAL_CHAR',
        'OLD_PASSWORD_HISTORY_LIMIT_COUNT'
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
