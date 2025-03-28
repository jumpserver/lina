<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
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
            this.$t('Basic'),
            [
              'SECURITY_WATERMARK_ENABLED',
              'SECURITY_SESSION_SHARE',
              'SESSION_EXPIRE_AT_BROWSER_CLOSE',
              'VIEW_ASSET_ONLINE_SESSION_INFO',
              'SECURITY_MAX_IDLE_TIME',
              'SECURITY_MAX_SESSION_TIME'
            ]
          ]
        ],
        fieldsMeta: {},
        onSubmit: async(validValues) => {
          const url = '/api/v1/settings/setting/?category=security_session'

          try {
            const res = await this.$axios.patch(url, validValues)

            if (res) {
              this.$message.success(this.$t('UpdateSuccessMsg'))
              this.$store.commit('settings/SET_SECURITY_WATERMARK_ENABLED', res['SECURITY_WATERMARK_ENABLED'])
            }
          } catch (error) {
            throw new Error(error)
          }
        }
      }
    }
  }
}
</script>
