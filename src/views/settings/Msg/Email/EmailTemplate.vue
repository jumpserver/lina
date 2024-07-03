<template>
  <div>
    <el-button size="mini" type="primary" icon="el-icon-setting" @click="visible = !visible"> {{ $t("Settings...") }} </el-button>
    <Dialog
      v-if="visible"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('EmailTemplate')"
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
  name: 'EmailTemplate',
  components: {
    GenericCreateUpdateForm,
    Dialog
  },
  data() {
    return {
      visible: false,
      fields: [
        [this.$t('General'), ['EMAIL_SUBJECT_PREFIX']],
        [this.$t('CreateUserContent'),
          [
            'EMAIL_CUSTOM_USER_CREATED_SUBJECT', 'EMAIL_CUSTOM_USER_CREATED_HONORIFIC', 'EMAIL_CUSTOM_USER_CREATED_BODY'
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
