<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'Basic',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security',
        hasDetailInMsg: false,
        fields: [
          [
            this.$t('common.Basic'),
            [
              'SECURITY_COMMAND_EXECUTION',
              'SECURITY_COMMAND_BLACKLIST',
              'SECURITY_SERVICE_ACCOUNT_REGISTRATION'
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
