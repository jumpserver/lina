<template>
  <div>
    <el-button size="small" @click="visible = !visible"> 设置 </el-button>
    <Dialog
      :title="$t('setting.createUserSetting')"
      :visible.sync="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="50%"
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
        'EMAIL_CUSTOM_USER_CREATED_SUBJECT', 'EMAIL_CUSTOM_USER_CREATED_HONORIFIC',
        'EMAIL_CUSTOM_USER_CREATED_BODY', 'EMAIL_CUSTOM_USER_CREATED_SIGNATURE'
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
        'EMAIL_CUSTOM_USER_CREATED_BODY': {
          el: {
            type: 'textarea',
            rows: 3
          }
        }
      },
      url: '/api/v1/settings/setting/?category=email_content'
    }
  },
  methods: {
    submitMethod() {
      return 'put'
    },
    onConfirm() {

    }
  }
}
</script>

<style scoped>

</style>
