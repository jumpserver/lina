<template>
  <div>
    <el-button size="mini" type="primary" @click="visible = !visible"> {{ $t("setting.Setting") }} </el-button>
    <Dialog
      v-if="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('setting.SMTP')"
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
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'SMTP',
  components: {
    GenericCreateUpdateForm,
    Dialog
  },
  data() {
    return {
      visible: false,
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'EMAIL_PROTOCOL', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD', 'EMAIL_USE_SSL', 'EMAIL_USE_TLS'
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
        EMAIL_PORT: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_HOST_PASSWORD: {
          component: UpdateToken
        },
        'EMAIL_CUSTOM_USER_CREATED_BODY': {
          el: {
            type: 'textarea',
            rows: 3
          }
        },
        EMAIL_USE_SSL: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_USE_TLS: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        }
      },
      url: '/api/v1/settings/setting/?category=email',
      submitMethod() {
        return 'patch'
      },
      onConfirm() {
      },
      cleanFormValue(data) {
        if (!data['EMAIL_HOST_PASSWORD']) {
          delete data['EMAIL_HOST_PASSWORD']
        }
        if (data['EMAIL_USE_SSL'] === null) {
          delete data['EMAIL_USE_SSL']
        }
        if (data['EMAIL_USE_TLS'] === null) {
          delete data['EMAIL_USE_TLS']
        }
        if (data['EMAIL_PORT'] === null) {
          delete data['EMAIL_PORT']
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
