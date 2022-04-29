<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'HostCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node']) {
      nodesInitial.push(this.$route.query.node)
    }
    const platformId = this.$route.query['platform'] || 1
    return {
      initial: {
        is_active: true,
        platform: parseInt(platformId),
        protocols: ['ssh/22'],
        nodes: nodesInitial
      },
      fields: [
        [this.$t('common.Basic'), ['hostname', 'ip', 'platform', 'public_ip', 'domain']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Auth'), ['admin_user']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: assetFieldsMeta,
      url: '/api/v1/assets/assets/',
      createSuccessNextRoute: { name: 'AssetDetail' },
      hasDetailInMsg: false
    }
  }
}
</script>

<style>

</style>
