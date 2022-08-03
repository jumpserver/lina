<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'DatabaseCreateUpdate',
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
      title: this.$t('assets.CreateDatabase'),
      initial: {
        is_active: true,
        platform: parseInt(platformId),
        protocols: ['mysql/22'],
        nodes: nodesInitial
      },
      url: '/api/v1/assets/databases/',
      createSuccessNextRoute: { name: 'AssetDetail' },
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['platform', 'hostname', 'ip', 'port', 'db_name']],
        [this.$t('assets.Domain'), ['domain']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ...assetFieldsMeta
      }
    }
  }
}
</script>

<style>

</style>
