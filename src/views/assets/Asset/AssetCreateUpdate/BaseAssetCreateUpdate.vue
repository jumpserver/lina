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
    const vm = this
    return {
      loading: true,
      platform: {},
      changePlatformID: '',
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
          [this.$t('Other'), ['domain', 'labels', 'is_active', 'comment']]
        ],
        fieldsMeta: {},
        performSubmit(validValues) {
          let url = this.url
          const { id = '' } = vm.meta
          const values = _.cloneDeep(validValues)
          const submitMethod = id ? 'put' : 'post'
          if (values.nodes && values.nodes.length === 0) {
            delete values['nodes']
          }
          if (id) {
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
      try {
        await this.getMeta()
        await this.genConfig()
        await this.setInitial()
        await this.setPlatformConstrains()
        console.log('iConfig: ', this.iConfig)
      } finally {
        this.loading = false
      }
    },
    async genConfig() {
      const { addFields, addFieldsMeta, defaultConfig } = this
      defaultConfig.fieldsMeta = assetFieldsMeta(this, this.meta.type)
      let url = this.url
      const { id = '' } = this.meta
      if (this.meta.platform && !id) {
        url = setUrlParam(url, 'platform', this.meta.platform)
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
    async getMeta() {
      let meta = await this.$store.dispatch('common/getDrawerActionMeta')
      if (!meta || !meta.action) {
        meta = {
          action: 'create',
          platform: this.$route.query.platform || '',
          type: this.$route.query.type || '',
          category: this.$route.query.category || '',
          node: this.$route.query.node || this.$route.query.node_id || ''
        }
      }
      this.meta = meta
    },
    async setInitial() {
      console.log('Meta in setInitial: ', this.meta)
      const { defaultConfig } = this
      const { node, platform } = this.meta
      const nodesInitial = node ? [node] : []
      const platformId = this.changePlatformID ? this.changePlatformID : (platform || 'Linux')
      const url = `/api/v1/assets/platforms/${platformId}/`
      this.platform = await this.$axios.get(url)
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(platformId),
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
      const hiddenCheckFields = ['protocols', 'domain']

      for (const field of hiddenCheckFields) {
        if (platform[field + '_enabled'] === false) {
          this.iConfig.fieldsMeta[field].hidden = () => true
        }
      }
    }
  }
}
</script>

<style>
</style>
