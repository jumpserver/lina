<template>
  <div class="auth-container">
    <IBox :title="$tc('BasicSettings')" class="auth-box-wrapper">
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      searchQuery: '',
      url: '/api/v1/settings/setting/?category=auth',
      fields: [
        'EMAIL_SUFFIX',
        'FORGOT_PASSWORD_URL',
        'LOGIN_REDIRECT_MSG_ENABLED'
      ],
      fieldsMeta: {
        FORGOT_PASSWORD_URL: {
          el: {
            placeholder: this.$t('ForgotPasswordURL')
          }
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
