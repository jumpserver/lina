<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
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
import { IBox } from '@/components'

export default {
  name: 'SecretKeyUpdate',
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
      url: '/api/v1/users/profile/secret-key/',
      fields: ['new_secret_key', 'new_secret_key_again'],
      fieldsMeta: {
        new_secret_key: {
          label: this.$t('users.NewPassword'),
          el: {
            type: 'password'
          }
        },
        new_secret_key_again: {
          label: this.$t('users.ConfirmPassword'),
          el: {
            type: 'password'
          }
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
