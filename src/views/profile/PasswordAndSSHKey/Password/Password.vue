<template>
  <IBox>
    <GenericCreateUpdateForm
      :encrypted-fields="encryptedFields"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :submit-method="submitMethod"
      :update-success-next-route="updateSuccessNextRoute"
      :url="url"
      class="password-update"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import UserPassword from '@/components/Form/FormFields/UserPassword.vue'
import { IBox } from '@/components'
import rules from '@/components/Form/DataForm/rules'
import { PasswordInput } from '@/components/Form/FormFields'

export default {
  name: 'Password',
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
          label: this.$t('OldPassword'),
          component: PasswordInput
        },
        new_password: {
          label: this.$t('NewPassword'),
          rules: [rules.RequiredChange],
          component: UserPassword,
          el: {
            userIsOrgAdmin: false
          }
        },
        new_password_again: {
          label: this.$t('ConfirmPassword'),
          component: PasswordInput
        }
      },
      updateSuccessNextRoute: {
        path: '/'
      }
    }
  },
  mounted() {
    this.fieldsMeta.new_password.el.userIsOrgAdmin = this.object['is_org_admin']
  },
  methods: {
    submitMethod() {
      return 'put'
    }
  }
}
</script>

<style lang="scss" scoped>
.password-update ::v-deep .el-input {
  width: 600px;
  max-width: 600px;
}
</style>
