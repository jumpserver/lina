<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'VirtualAppPublicationCreate',
  components: { GenericCreateUpdatePage },
  data() {
    const app = this.$route.params.id
    const provider = this.$route.params.providerId
    return {
      config: {
        url: '/api/v1/terminal/virtual-app-publications/',
        initial: {
          app,
          provider,
          status: 'pending'
        },
        fields: [[this.$t('Basic'), app ? ['provider'] : ['app']]],
        addFieldsMeta: {
          app: { rules: [{ required: true }] },
          provider: { rules: [{ required: true }] }
        },
        createSuccessNextRoute: app
          ? { name: 'VirtualAppDetail', params: { id: app } }
          : { name: 'AppProviderDetail', params: { id: provider } }
      }
    }
  }
}
</script>
