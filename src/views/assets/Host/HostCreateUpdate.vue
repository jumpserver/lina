<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '../const'

export default {
  name: 'HostCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      platform: {},
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['hostname', 'ip', 'platform', 'domain']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Node'), ['nodes']],
        this.$route.params.id ? null : [this.$t('assets.Account'), ['accounts']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: assetFieldsMeta(this),
      url: '/api/v1/assets/assets/',
      createSuccessNextRoute: { name: 'AssetDetail' },
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
        domain: this.platform['domain_default'],
        admin_user: this.platform['admin_user_default']
      }
      const limits = this.platform['type_limits']
      console.log('Fields meta: ', this.fieldsMeta)
      this.fieldsMeta.protocols.el.choices = limits['protocols_limit']
      this.initial = initial
      this.loading = false
    }
  }
}
</script>

<style>

</style>
