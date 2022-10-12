<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="iConfig" />
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
      loading: true,
      defaultConfig: {
        initial: {},
        platform: {},
        url: '/api/v1/assets/hosts/',
        createSuccessNextRoute: { name: 'AssetList' },
        updateSuccessNextRoute: { name: 'AssetList' },
        hasDetailInMsg: false,
        fields: [
          [this.$t('common.Basic'), ['name', 'address', 'platform', 'domain']],
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
      // 过滤类型为：null, undefined 的元素
      defaultConfig.fields = defaultConfig.fields.filter(Boolean)
      const config = _.merge(defaultConfig, { url })
      if (addFields.length > 0) {
        const defaultFields = Object.fromEntries(config.fields)
        for (const [key, value] of addFields) {
          if (defaultFields.hasOwnProperty(key)) {
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
      await this.setInitial()
      await this.setPlatformConstrains()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async setInitial() {
      const { defaultConfig } = this
      const { node, platform } = this.$route?.query || {}
      const nodesInitial = node || []
      const platformId = platform || 1
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(platformId),
        protocols: this.platform.protocols || []
      }
      this.defaultConfig.initial = Object.assign({}, initial, defaultConfig.initial)
    },
    async setPlatformConstrains() {
      const { platform } = this
      this.$set(this.defaultConfig.fieldsMeta.protocols.el, 'choices', (platform['protocols'] || []))
      this.$set(this.defaultConfig.fieldsMeta.accounts.el, 'protocols', (platform['protocols'] || []))
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
