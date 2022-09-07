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
      initial: {
        is_active: true,
        platform: parseInt(platformId),
        nodes: nodesInitial
      },
      url: '/api/v1/assets/databases/',
      createSuccessNextRoute: { name: 'AssetDetail' },
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'ip', 'platform', 'db_name']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Domain'), ['domain']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: assetFieldsMeta(this)
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
        protocols: this.platform.protocols_default,
        nodes: nodesInitial,
        domain: this.platform.domain_default
      }
      const constraints = this.platform['type_constraints']
      this.fieldsMeta.protocols.el.choices = constraints['protocols']
      this.initial = initial
      this.loading = false
    }
  }
}
</script>

<style>

</style>
