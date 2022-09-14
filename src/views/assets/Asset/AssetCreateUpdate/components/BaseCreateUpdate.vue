<template>
  <GenericCreateUpdatePage v-if="!iConfig.loading" v-bind="iConfig" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  components: { GenericCreateUpdatePage },
  props: {
    url: {
      type: String,
      default: () => '',
      required: true
    },
    addFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultConfig: {
        loading: true,
        initial: {},
        platform: {},
        url: '/api/v1/assets/hosts/',
        createSuccessNextRoute: { name: 'AssetList' },
        hasDetailInMsg: false,
        fields: [
          [this.$t('common.Basic'), ['name', 'ip', 'platform', 'domain']],
          [this.$t('assets.Protocols'), ['protocols']],
          [this.$t('assets.Node'), ['nodes']],
          this.$route.params.id ? null : [this.$t('assets.Account'), ['accounts']],
          [this.$t('assets.Label'), ['labels']],
          [this.$t('common.Other'), ['is_active', 'comment']]
        ],
        fieldsMeta: assetFieldsMeta()
      },
      platform: {}
    }
  },
  computed: {
    iConfig() {
      const { url, addFields, defaultConfig } = this
      const config = _.merge(defaultConfig, { url })
      if (addFields.length > 0) {
        const defaultFields = Object.fromEntries(defaultConfig.fields)
        for (const [key, value] of addFields) {
          if (Object.prototype.hasOwnProperty.call(defaultFields, key)) {
            defaultFields[key] = new Set([...defaultFields[key], ...(value || [])])
          }
        }
        config.fields = Object.entries(defaultFields)
      }

      return config
    }
  },
  async created() {
    try {
      await this.setPlatformInitial()
    } finally {
      this.defaultConfig.loading = false
    }
  },
  methods: {
    async setPlatformInitial() {
      const nodesInitial = []
      if (!this.defaultConfig.initial) this.$set(this.defaultConfig, 'initial', {})
      if (this.$route.query['node']) {
        nodesInitial.push(this.$route.query.node)
      }
      const platformId = this.$route.query['platform'] || 1
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(platformId),
        protocols: this.platform.protocols || []
      }
      this.defaultConfig.initial = Object.assign({}, initial, this.defaultConfig.initial)
      this.$set(this.defaultConfig.fieldsMeta.protocols.el, 'choices', (this.platform['protocols'] || []))
      const hiddenCheckFields = ['protocols', 'domain']

      for (const field of hiddenCheckFields) {
        if (this.platform[field + '_enabled'] === false) {
          this.defaultConfig.fieldsMeta[field].hidden = () => true
        }
      }
    }
  }
}
</script>

<style>
</style>
