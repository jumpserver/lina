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
          label: '原密码',
          el: {
            type: 'password'
          }
        },
        new_password: {
          label: '新密码',
          el: {
            type: 'password'
          }
        },
        new_password_again: {
          label: '确认密码',
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
