<template>
  <GenericCreateUpdatePage v-bind="iConfig" v-if="!loading" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { encryptPassword } from '@/utils/session-encrypt'
import { getUpdateObjURL, setUrlParam, getSelectedAssetNodeId } from '@/utils/common/index'
import { assetFieldsMeta, getWebAssetSettingDefaults } from '@/views/assets/const'

const getRelatedId = (value) => value?.pk ?? value?.id ?? value?.value ?? value

// Node 的 value 字段是显示名，不能当作 id；只取真正的主键。
const getNodeId = (value) => {
  if (value && typeof value === 'object') {
    return value.id ?? value.pk ?? null
  }
  return value
}

const normalizeNodeIds = (nodes) => {
  if (!Array.isArray(nodes)) {
    return []
  }
  return nodes
    .map((item) => getNodeId(item))
    .filter((item) => item !== undefined && item !== null && item !== '')
}

const hasRemovedPlatformProtocol = (selectedProtocols, platformProtocols) => {
  const selectedNames = new Set(
    (Array.isArray(selectedProtocols) ? selectedProtocols : []).map(({ name }) => name)
  )
  return (Array.isArray(platformProtocols) ? platformProtocols : []).some(
    ({ name }) => !selectedNames.has(name)
  )
}

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
      initPromise: null,
      pendingInit: false,
      // 在 meta 中，可能改变 platform id
      platformID: this.$context.get('platform'),
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
          const id = this.$context.get('id')
          const values = _.cloneDeep(validValues)
          const submitMethod = id ? 'put' : 'post'

          // 后端 validate_nodes：nodes 为空会落到组织根节点。
          // 更新时表单里的 nodes 可能仍是对象列表、或未触碰字段时被清空成 []，
          // 这里统一成主键列表，并在 PUT 时空值回退到初始节点，避免误挪到根节点。
          const initialNodeIds = normalizeNodeIds(this.initialFormValue?.nodes)
          let nodeIds = normalizeNodeIds(values.nodes)
          if (submitMethod === 'put' && nodeIds.length === 0 && initialNodeIds.length > 0) {
            nodeIds = initialNodeIds
          }
          if (nodeIds.length > 0) {
            values.nodes = nodeIds
          } else if (submitMethod === 'put') {
            // 保持与历史行为一致：PUT 不显式提交空 nodes，避免后端写回 org_root
            delete values.nodes
          } else {
            values.nodes = nodeIds
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

          const initialPlatformId = getRelatedId(this.initialFormValue?.platform)
          const selectedPlatformId = getRelatedId(values.platform)
          const platformChanged =
            submitMethod === 'put' && String(initialPlatformId) !== String(selectedPlatformId)
          const platformProtocols = this.fieldsMeta?.protocols?.el?.choices
          const shouldSyncProtocols =
            platformChanged && hasRemovedPlatformProtocol(values.protocols, platformProtocols)

          const request = this.$axios[submitMethod](url, values)
          if (!shouldSyncProtocols) {
            return request
          }

          // 平台切换时后端会补齐新平台协议；待平台更新完成后再同步用户最终选择。
          // 返回完整 Promise 链，确保抽屉关闭和列表刷新发生在第二次请求之后。
          return request.then(() =>
            this.$axios.patch(url, {
              protocols: values.protocols
            })
          )
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
        this.pendingInit = true
        return this.initPromise
      }
      this.initing = true
      this.initPromise = (async () => {
        do {
          this.pendingInit = false
          await this.genConfig()
          await this.setInitial()
          await this.setPlatformConstrains()
        } while (this.pendingInit)
      })()
      try {
        await this.initPromise
      } finally {
        this.initing = false
        this.initPromise = null
        this.pendingInit = false
        this.loading = false
      }
    },
    async genConfig() {
      const { addFields, addFieldsMeta, defaultConfig } = this
      defaultConfig.fieldsMeta = assetFieldsMeta(this)
      let url = this.url
      const id = this.$context.get('id')
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
    async setInitial(requestedPlatformID) {
      const { defaultConfig } = this
      const nodeId = getSelectedAssetNodeId(this)
      const nodesInitial = nodeId ? [nodeId] : []
      const platformId = requestedPlatformID || this.platformID || 'Linux'
      const url = `/api/v1/assets/platforms/${platformId}/`
      const platform = await this.$axios.get(url)
      if (
        requestedPlatformID !== undefined &&
        String(this.platformID) !== String(requestedPlatformID)
      ) {
        return false
      }
      this.platform = platform
      const initial = {
        labels: [],
        is_active: true,
        nodes: nodesInitial,
        platform: parseInt(this.platform.id),
        protocols: []
      }
      if (this.platform.category?.value === 'web') {
        Object.assign(initial, getWebAssetSettingDefaults(this.platform.protocols))
      }
      if (this.updateInitial) {
        await this.updateInitial(initial)
      }
      this.iConfig.initial = Object.assign({}, initial, defaultConfig.initial)
      return true
    },
    async setPlatformConstrains() {
      const { platform } = this
      let protocols = platform?.protocols || []
      protocols = protocols.map((i) => {
        if (i.name === 'http') {
          i.display_name = 'http(s)'
        }
        // 这个不删除会导致时，把 platform id 提交成 asset 的
        delete i['id']
        return i
      })
      const protocolChoices = this.iConfig.fieldsMeta.protocols.el.choices
      protocolChoices.splice(0, protocolChoices.length, ...protocols)
      this.iConfig.fieldsMeta.protocols.el.key = `asset-protocols-${platform.id}`
      this.iConfig.fieldsMeta.accounts.el.platform = platform
    }
  }
}
</script>

<style></style>
