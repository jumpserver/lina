<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      url: '/api/v1/assets/account-templates/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'username', 'privileged']],
        [this.$t('assets.Secret'), ['secret_type', 'secret']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  }
}
</script>

<style>

</style>
