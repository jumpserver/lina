<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="iConfig" v-on="$listeners" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { encryptPassword } from '@/utils/crypto'
import { getUpdateObjURL, setUrlParam } from '@/utils/common'
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
      type: [Array, Function],
      default: () => []
    },
    addFieldsMeta: {
      type: Object,
      default: () => ({})
    },
    removeFields: {
      type: [Array, Function],
      default: () => []
    },
    createSuccessNextRoute: {
      type: Object,
      default: () => ({ name: 'AssetList' })
    },
    updateSuccessNextRoute: {
      type: Object,
      default: () => ({ name: 'AssetList' })
    },
    updateInitial: {
      type: Function,
      default: (initial) => {
        return initial
      }
    }
  },
  data() {
    return {
      loading: true,
      platform: {},
      initing: false,
      // 在 meta 中，可能改变 platform id
      platformID: this.$route.query.platform || '',
      meta: {},
      iConfig: {},
      defaultConfig: {
        initial: {},
        platform: {},
        url: '/api/v1/assets/hosts/',
        hasReset: false,
        createSuccessNextRoute: this.createSuccessNextRoute,
        updateSuccessNextRoute: this.updateSuccessNextRoute,
        hasDetailInMsg: false,
        fields: [
          [this.$t('Basic'), ['name', 'address', 'platform', 'nodes']],
          [this.$t('Protocol'), ['protocols']],
          [this.$t('Account'), ['accounts']],
          [this.$t('Other'), ['directory_services', 'zone', 'labels', 'is_active', 'comment']]
        ],
        fieldsMeta: {},
        performSubmit(validValues) {
          let url = this.url
          const { id = '' } = this.$route.params
          const values = _.cloneDeep(validValues)
          const submitMethod = id ? 'put' : 'post'

          if (values.nodes && values.nodes.length === 0) {
            delete values['nodes']
          }

          if (submitMethod === 'put') {
            url = getUpdateObjURL(url, id)
            delete values['accounts']
          } else {
            const accounts = values?.accounts || []
            values.accounts = accounts.map((item) => {
              item['secret'] = encryptPassword(item['secret'])
              return item
            })
          }
          return this.$axios[submitMethod](url, values)
        }
      }
    }
  },
  async created() {
    await this.init()
  },
  methods: {
    async init() {
      // 更改平台时，就不重新 loading 了
      this.$log.debug('Initing asset base upcate create', this.initing)
      if (this.initing) {
        return
      }
      this.initing = true
      try {
        await this.genConfig()
        await this.setInitial()
        await this.setPlatformConstrains()
      } finally {
        this.initing = false
        this.loading = false
      }
    },
    async genConfig() {
      const { addFields, addFieldsMeta, defaultConfig } = this
      defaultConfig.fieldsMeta = assetFieldsMeta(this)
      let url = this.url
      const id = this.$route.params.id
      if (!id) {
        url = setUrlParam(url, 'platform', this.platformID)
      }
      // 过滤类型为：null, undefined 的元素
      defaultConfig.fields = defaultConfig.fields.filter(Boolean)
      const config = _.merge(defaultConfig, { url })
      for (const [groupName, adds, pos] of addFields) {
        const group = config.fields.find(([name]) => name === groupName)
        if (group) {
          group[1] = group[1].concat(adds)
        } else {
          config.fields.splice(pos, 0, [groupName, adds])
        }
      }

      for (const [name, meta] of Object.entries(addFieldsMeta)) {
        if (config.fieldsMeta[name]) {
          config.fieldsMeta[name] = Object.assign(config.fieldsMeta[name], meta)
        } else {
          config.fieldsMeta[name] = meta
        }
      }
      this.iConfig = config
    },
    async setInitial() {
      const { defaultConfig } = this
      const { node } = this.$route.query
      const nodesInitial = node ? [node] : []
      const platformId = this.platformID || 'Linux'
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(this.platform.id),
        protocols: []
      }
      if (this.updateInitial) {
        await this.updateInitial(initial)
      }
      this.iConfig.initial = Object.assign({}, initial, defaultConfig.initial)
    },
    async setPlatformConstrains() {
      const { platform } = this
      let protocols = platform?.protocols || []
      protocols = protocols.map(i => {
        if (i.name === 'http') {
          i.display_name = 'http(s)'
        }
        // 这个不删除会导致时，把 platform id 提交成 asset 的
        delete i['id']
        return i
      })
      const protocolChoices = this.iConfig.fieldsMeta.protocols.el.choices
      protocolChoices.splice(0, protocolChoices.length, ...protocols)
      this.iConfig.fieldsMeta.accounts.el.platform = platform
    }
  }
}
</script>

<style>
</style>
