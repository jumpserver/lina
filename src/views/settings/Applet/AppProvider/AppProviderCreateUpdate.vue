<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'AppProviderCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      config: {
        url: '/api/v1/terminal/app-providers/',
        fields: [
          [this.$t('Basic'), ['name', 'hostname', 'host']],
          [this.$t('Connection'), ['runtime_type', 'connection_mode', 'service_url']],
          [this.$t('Other'), ['deploy_options', 'comment']]
        ],
        addFieldsMeta: {
          deploy_options: {
            fields: ['CORE_HOST', 'IGNORE_VERIFY_CERTS', 'PANDA_IMAGE', 'PANDA_RANGE_PORTS']
          },
          service_url: {
            hidden: (formValue) => !formValue.host
          }
        },
        createSuccessNextRoute: { name: 'AppProviderDetail' },
        updateSuccessNextRoute: { name: 'AppProviderDetail' }
      }
    }
  }
}
</script>
