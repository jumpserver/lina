<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'AssetCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['name', 'ip', 'platform', 'domain']]
        // [this.$t('assets.Protocol'), ['protocols']],
        // [this.$t('assets.Node'), ['nodes']],
        // this.$route.params.id ? null : [this.$t('assets.Account'), ['accounts']],
        // [this.$t('assets.Label'), ['labels']],
        // [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: assetFieldsMeta(),
      url: '/api/v1/assets/assets/',
      createSuccessNextRoute: { name: 'AssetDetail', query: { 'activeTab': 'Account' }},
      hasDetailInMsg: false
    }
  },
  mounted() {
    this.setPlatformInitial()
  },
  methods: {
    async setPlatformInitial() {
      const nodesInitial = []
      if (this.$route.query['node']) {
        nodesInitial.push(this.$route.query.node)
      }
      const platformId = this.$route.query['platform'] || 1
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        is_active: true,
        platform: parseInt(platformId),
        protocols: this.platform.protocols_default || ['ssh/22'],
        nodes: nodesInitial,
        domain: this.platform['domain_default']
      }
      const limits = this.platform['type_constraint']
      this.fieldsMeta.protocols.el.choices = limits['protocols']
      this.initial = initial
      this.loading = false
    }
  }
}
</script>

<style>

</style>
