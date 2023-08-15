<template>
  <div>
    <el-button size="mini" type="primary" @click="visible = !visible"> {{ $t("setting.Setting") }} </el-button>
    <Dialog
      v-if="visible"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('setting.CreateUserSetting')"
      :visible.sync="visible"
      width="70%"
      @confirm="onConfirm()"
    >
      <GenericCreateUpdateForm v-bind="$data" />
    </Dialog>
  </div>

</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
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
        'EMAIL_CUSTOM_USER_CREATED_BODY'
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
      url: '/api/v1/settings/setting/?category=email_content',
      submitMethod() {
        return 'patch'
      },
      onConfirm() {
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
