<template>
  <IBox>
    <GenericCreateUpdateForm
      :create-success-next-route="successUrl"
      :has-detail-in-msg="false"
      :submit-method="submitMethod"
      :update-success-next-route="successUrl"
      v-bind="$data"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: [
        [
          this.$t('setting.Basic'), [
            'TICKETS_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
        TICKETS_ENABLED: {
          disabled: this.$store.getters.hasValidLicense
        }
      },
      successUrl: { name: 'Basic' },
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    }
  }
}
</script>

<style scoped>
</style>
