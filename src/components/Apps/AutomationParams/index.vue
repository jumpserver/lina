<template>
  <div>
    <div>
      <el-button
        size="mini"
        type="primary"
        :disabled="isDisabled"
        @click="onOpenDialog"
      >{{ $tc('common.Setting') }}</el-button>
    </div>
    <Dialog
      v-if="visible"
      width="60%"
      :visible.sync="visible"
      :title="title"
      :show-cancel="false"
      :show-confirm="false"
      :destroy-on-close="true"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <AutoDataForm
        ref="autoDataForm"
        :form="form"
        class="data-form"
        v-bind="config"
        @submit="onSubmit"
      />
    </Dialog>
  </div>
</template>

<script>
import { Dialog, AutoDataForm } from '@/components'

export default {
  componentName: 'AutomationParams',
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: function() {
        return this.$t('assets.PushParams')
      }
    },
    assets: {
      type: Array,
      default: () => []
    },
    nodes: {
      type: Array,
      default: () => []
    },
    method: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: `/api/v1/assets/platform-automation-methods/`
    }
  },
  data() {
    return {
      remoteMeta: {},
      visible: false,
      isDisabled: true,
      form: this.value,
      node_ids: this.nodes,
      asset_ids: this.assets,
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        method: 'get',
        fields: [],
        fieldsMeta: {}
      }
    }
  },
  computed: {
    refForm() {
      return this.$refs.autoDataForm
    }
  },
  watch: {
    nodes: {
      handler(val) {
        this.node_ids = val
        this.onFieldChangeHandle()
      },
      deep: true
    },
    assets: {
      handler(val) {
        this.asset_ids = val
        this.onFieldChangeHandle()
      },
      deep: true
    }
  },
  created() {
    this.getUrlMeta()
  },
  methods: {
    async getUrlMeta() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      this.remoteMeta = data.actions[this.config.method.toUpperCase()] || {}
    },
    async getFilterPlatforms() {
      return await this.$axios.post(
        '/api/v1/assets/platforms/filter-nodes-assets/',
        {
          'node_ids': this.node_ids,
          'asset_ids': this.asset_ids
        }
      )
    },
    async onFieldChangeHandle() {
      const platforms = await this.getFilterPlatforms()
      let pushAccountMethods = platforms.map(i => i.automation[this.method])
      pushAccountMethods = _.uniq(pushAccountMethods)
      // 检测是否有可设置的推送方式
      const hasCanSettingPushMethods = _.intersection(pushAccountMethods, Object.keys(this.remoteMeta))
      this.setFormConfig(hasCanSettingPushMethods)
      if (hasCanSettingPushMethods.length > 0) {
        this.isDisabled = false
        this.$emit('input', this.form)
      } else {
        this.isDisabled = true
        this.$emit('input', {})
      }
    },
    setFormConfig(methods) {
      const newForm = {}
      const fields = []
      const fieldsMeta = {}
      this.config.fields = []

      for (const method of methods) {
        const filterField = this.remoteMeta[method] || {}
        // 修改资产、节点时不点击设置按钮也需要获取form表单值暴露出去
        if (this.form.hasOwnProperty(method)) {
          newForm[method] = this.form[method]
        }
        fields.push([filterField.label, [method]])
        fieldsMeta[method] = {
          fields: [],
          fieldsMeta: {}
        }
        if (Object.keys(filterField?.children || {}).length > 0) {
          for (const [k, v] of Object.entries(filterField.children)) {
            const item = {
              ...v,
              type: 'input'
            }
            delete item.default
            fieldsMeta[method].fields.push(k)
            fieldsMeta[method].fieldsMeta[k] = item
          }
        }
      }

      this.form = newForm
      this.config.fields = fields
      this.config.fieldsMeta = fieldsMeta
    },
    onOpenDialog() {
      this.visible = true
    },
    onSubmit(form) {
      this.visible = false
      this.$emit('input', form)
      this.$log.debug('Auto push form:', form)
    }
  }
}
</script>

<style scoped>
</style>
