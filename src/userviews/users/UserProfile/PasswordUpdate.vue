<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :url="url"
      :get-method="getMethod"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

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
      fieldsMeta: {
        old_password: {
          label: this.$t('users.OldPassword'),
          el: {
            type: 'password'
          }
        },
        new_password: {
          label: this.$t('users.NewPassword'),
          el: {
            type: 'password'
          }
        },
        new_password_again: {
          label: this.$t('users.ConfirmPassword'),
          el: {
            type: 'password'
          }
        }
      }
    }
  },
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
