<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :has-detail-in-msg="false"
      :submit-method="submitMethod"
      :url="url"
    />
  </IBox>

</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import IBox from '@/components/Common/IBox/index.vue'
import { LeakPasswords } from '@/components'

export default {
  name: 'EmailContent',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      visible: false,
      fields: [
        [
          this.$t('Basic'),
          [
            'SECURITY_PASSWORD_EXPIRATION_TIME',
            'OLD_PASSWORD_HISTORY_LIMIT_COUNT'
          ]
        ],
        [
          this.$t('PasswordRule'),
          [
            'SECURITY_LEAK_PASSWORD_LIST', 'SECURITY_PASSWORD_MIN_LENGTH', 'SECURITY_ADMIN_USER_PASSWORD_MIN_LENGTH',
            'SECURITY_PASSWORD_UPPER_CASE', 'SECURITY_PASSWORD_LOWER_CASE',
            'SECURITY_PASSWORD_NUMBER', 'SECURITY_PASSWORD_SPECIAL_CHAR'
          ]
        ]
      ],
      fieldsMeta: {
        SECURITY_LEAK_PASSWORD_LIST: {
          component: LeakPasswords,
          label: this.$t('LeakPasswordList')
        }
      },
      url: '/api/v1/settings/setting/?category=security_password'
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
