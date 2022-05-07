<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :encrypted-fields="encryptedFields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :url="url"
      :submit-method="submitMethod"
      class="password-update"
      :update-success-next-route="updateSuccessNextRoute"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import UserPassword from '@/components/FormFields/UserPassword'
import { IBox } from '@/components'
import rules from '@/components/DataForm/rules'
import { PasswordInput } from '@/components/FormFields'

export default {
  name: 'PasswordUpdate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: '/api/v1/users/profile/password/',
      fields: ['old_password', 'new_password', 'new_password_again'],
      encryptedFields: ['old_password', 'new_password', 'new_password_again'],
      fieldsMeta: {
        old_password: {
          label: this.$t('users.OldPassword'),
          component: PasswordInput
        },
        new_password: {
          label: this.$t('users.NewPassword'),
          rules: [rules.RequiredChange],
          component: UserPassword
        },
        new_password_again: {
          label: this.$t('users.ConfirmPassword'),
          component: PasswordInput
        }
      },
      updateSuccessNextRoute: {
        path: '/'
      }
    }
  },
  methods: {
    submitMethod() {
      return 'put'
    }
  }
}
</script>

<style lang="scss" scoped>
.password-update >>> .el-input {
  width: 600px;
  max-width: 600px;
}
</style>
