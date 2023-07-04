<template>
  <div>
    <div>
      <el-button
        :disabled="isDisabled"
        size="mini"
        type="primary"
        @click="onOpenDialog"
      >{{ $tc('common.Setting') }}</el-button>
    </div>
    <Dialog
      v-if="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      :visible.sync="visible"
      v-bind="$attrs"
      width="60%"
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
import { AutoDataForm, Dialog } from '@/components'

export default {
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
    platforms: {
      type: Array,
      default: () => []
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
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        method: 'get',
        fields: [],
        fieldsMeta: {}
      },
      onFieldChangeHandler: _.debounce(this.handleFieldChange, 1000)
    }
  },
  watch: {
    nodes: {
      handler(val) {
        this.onFieldChangeHandler()
      },
      deep: true
    },
    assets: {
      handler(val) {
        this.onFieldChangeHandler()
      },
      deep: true
    },
    platforms: {
      handler(val) {
        this.onFieldChangeHandler()
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
      const res = await this.$axios.post(
        '/api/v1/assets/platforms/filter-nodes-assets/',
        {
          'node_ids': this.nodes,
          'asset_ids': this.assets,
          'platform_ids': this.platforms
        }
      )
      return res
    },
    async handleFieldChange() {
      const platforms = await this.getFilterPlatforms()
      let pushAccountMethods = platforms.map(i => i.automation?.push_account_method)
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
      this.$emit('input', form)
      this.visible = false
      this.$log.debug('Auto push form:', form)
    }
  }
}
</script>

<style scoped>
</style>
