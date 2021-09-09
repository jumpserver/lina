<template>
  <div>
    <el-button size="mini" type="primary" @click="visible = !visible"> {{ $t("setting.Setting") }} </el-button>
    <Dialog
      v-if="visible"
      :title="$t('setting.SMTP')"
      :visible.sync="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      @confirm="onConfirm()"
    >
      <GenericCreateUpdateForm v-bind="$data" />
    </Dialog>
  </div>

</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { Dialog } from '@/components'

export default {
  name: 'SMTP',
  components: {
    GenericCreateUpdateForm,
    Dialog
  },
  data() {
    return {
      visible: false,
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD'
          ]
        ],
        [
          this.$t('setting.Security'),
          [
            'EMAIL_USE_SSL', 'EMAIL_USE_TLS'
          ]
        ]
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
      url: '/api/v1/settings/setting/?category=email',
      submitMethod() {
        return 'patch'
      },
      onConfirm() {}
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
