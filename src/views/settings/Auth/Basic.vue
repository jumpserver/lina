<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/Common/IBox'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=auth',
      fields: [
        'EMAIL_SUFFIX', 'FORGOT_PASSWORD_URL', 'LOGIN_REDIRECT_MSG_ENABLED'
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
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
