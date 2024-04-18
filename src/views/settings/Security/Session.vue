<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'SessionSecurity',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        fields: [
          [
            this.$t('common.Basic'),
            [
              'SECURITY_WATERMARK_ENABLED',
              'SECURITY_SESSION_SHARE',
              'SESSION_EXPIRE_AT_BROWSER_CLOSE',
              'SECURITY_MAX_IDLE_TIME',
              'SECURITY_MAX_SESSION_TIME'
            ]
          ]
        ],
        fieldsMeta: {
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
