<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=auth',
      fields: [
        [
          this.$t('common.Basic'),
          [
            'FORGOT_PASSWORD_URL', 'LOGIN_REDIRECT_MSG_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
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
