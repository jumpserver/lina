<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'Basic',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_basic',
        hasDetailInMsg: false,
        fields: [
          [
            this.$t('common.Basic'),
            [
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
