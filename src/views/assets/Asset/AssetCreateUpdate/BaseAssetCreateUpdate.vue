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
    },
    addFieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      platform: {},
      defaultConfig: {
        initial: {},
        platform: {},
        url: '/api/v1/assets/hosts/',
        createSuccessNextRoute: { name: 'AssetList' },
        updateSuccessNextRoute: { name: 'AssetList' },
        hasDetailInMsg: false,
        fields: [
          [this.$t('common.Basic'), ['name', 'address', 'platform']],
          [this.$t('assets.Network'), ['domain', 'protocols']],
          [this.$t('assets.Account'), ['accounts']],
          [this.$t('assets.Node'), ['nodes']],
          [this.$t('assets.Label'), ['labels']],
          [this.$t('common.Other'), ['is_active', 'comment']]
        ],
        fieldsMeta: assetFieldsMeta(this)
      }
    }
  },
  computed: {
    iConfig() {
      const { url, addFields, addFieldsMeta, defaultConfig } = this
      // 过滤类型为：null, undefined 的元素
      defaultConfig.fields = defaultConfig.fields.filter(Boolean)
      const config = _.merge(defaultConfig, { url })
      for (const [groupName, adds] of addFields) {
        const group = config.fields.find(([name]) => name === groupName)
        if (group) {
          group[1] = group[1].concat(adds)
        } else {
          config.fields.splice(1, 0, [groupName, adds])
        }
      }

      for (const [name, meta] of Object.entries(addFieldsMeta)) {
        if (config.fieldsMeta[name]) {
          config.fieldsMeta[name] = Object.assign(config.fieldsMeta[name], meta)
        } else {
          config.fieldsMeta[name] = meta
        }
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
      const nodesInitial = node ? [node] : []
      const platformId = platform || 1
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(platformId),
        protocols: []
      }
      this.defaultConfig.initial = Object.assign({}, initial, defaultConfig.initial)
    },
    async setPlatformConstrains() {
      const { platform } = this
      this.defaultConfig.fieldsMeta.protocols.el.choices.splice(0, 0, ...platform.protocols)
      this.defaultConfig.fieldsMeta.accounts.el.platform = platform
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
