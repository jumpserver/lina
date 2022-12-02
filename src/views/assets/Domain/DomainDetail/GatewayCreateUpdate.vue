<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="iConfig" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'GatewayCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      loading: true,
      platform: {},
      defaultConfig: {
        initial: {},
        platform: {},
        url: '/api/v1/assets/gateways/',
        hasDetailInMsg: false,
        fields: [
          [this.$t('common.Basic'), ['name', 'address', 'platform']],
          [this.$t('assets.Network'), ['domain', 'protocols']],
          [this.$t('assets.Account'), ['accounts']],
          [this.$t('assets.Node'), ['nodes']],
          [this.$t('assets.Label'), ['labels']],
          [this.$t('common.Other'), ['is_active', 'comment']]
        ],
        fieldsMeta: assetFieldsMeta(this),
        cleanFormValue(values) {
          const { id = '' } = this.$route.params
          if (id) delete values['accounts']
          return values
        },
        getNextRoute(res, method) {
          const domain = res.domain.id
          const route = {
            name: 'DomainDetail',
            params: {
              id: domain
            },
            query: {
              activeTab: 'GatewayList'
            }
          }
          return route
        }
      }

    }
  },
  computed: {
    iConfig() {
      const { url, defaultConfig } = this
      // 过滤类型为：null, undefined 的元素
      defaultConfig.fields = defaultConfig.fields.filter(Boolean)
      const config = _.merge(defaultConfig, { url })
      return config
    }
  },
  async created() {
    try {
      await this.setInitial()
      await this.setPlatformConstrains()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async setInitial() {
      const { defaultConfig } = this
      const { node } = this.$route?.query || {}
      const nodesInitial = node ? [node] : []
      const url = `/api/v1/assets/platforms/?name=Gateway`
      this.platform = await this.$axios.get(url)
      this.platform = this.platform[0]
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(this.platform.id),
        protocols: [],
        domain: this.$route.query.domain
      }
      if (this.updateInitial) {
        this.updateInitial(initial)
      }
      this.defaultConfig.initial = Object.assign({}, initial, defaultConfig.initial)
    },
    async setPlatformConstrains() {
      const { platform } = this
      const protocols = platform.protocols.filter(item => item.name === 'ssh')
      this.defaultConfig.fieldsMeta.protocols.el.choices.splice(0, 0, ...protocols)
      this.defaultConfig.fieldsMeta.accounts.el.platform = platform
      this.defaultConfig.fieldsMeta.domain.disabled = true
      const hiddenCheckFields = ['protocols', 'domain']

      for (const field of hiddenCheckFields) {
        if (platform[field + '_enabled'] === false) {
          this.defaultConfig.fieldsMeta[field].hidden = () => true
        }
      }
    }
  }
}
</script>

<style>
</style>
