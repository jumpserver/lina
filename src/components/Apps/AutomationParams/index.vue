<template>
  <div>
    <div>
      <el-button
        :disabled="isDisabled"
        size="mini"
        type="primary"
        @click="onOpenDialog"
      >
        {{ $tc('common.Setting') }}
      </el-button>
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
import Dialog from '../../Dialog'
import AutoDataForm from '../../Form/AutoDataForm'

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
    platforms: {
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
    const vm = this
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
      onFieldChangeHandler: _.debounce(vm.handleFieldChange, 1000)
    }
  },
  computed: {
    refForm() {
      return this.$refs.autoDataForm
    }
  },
  watch: {
    nodes: {
      handler() {
        this.onFieldChangeHandler()
      },
      deep: true
    },
    assets: {
      handler() {
        this.onFieldChangeHandler()
      },
      deep: true
    },
    platforms: {
      handler(newVal) {
        this.onFieldChangeHandler()
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    await this.getUrlMeta()
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
          'node_ids': this.nodes,
          'asset_ids': this.assets,
          'platform_ids': this.platforms.map(i => i.id || i.pk || i)
        }
      )
    },
    async handleFieldChange() {
      const platforms = await this.getFilterPlatforms()
      let pushAccountMethods = platforms.map(i => i.automation[this.method])
      pushAccountMethods = _.uniq(pushAccountMethods)
      // 检测是否有可设置的推送方式
      const hasCanSettingPushMethods = _.intersection(pushAccountMethods, Object.keys(this.remoteMeta))
      this.setFormConfig(hasCanSettingPushMethods)
      this.isDisabled = hasCanSettingPushMethods.length <= 0
    },
    setFormConfig(methods) {
      const newForm = {}
      const fields = []
      const fieldsMeta = {}
      this.config.fields = []
      // Todo: 未来改成后端处理，生成 serializer, 这里就不用判断类型了
      const typeMapper = {
        'string': 'input',
        'boolean': 'switch'
      }

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
              type: typeMapper[v.type] || 'input'
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
      this.form = form
      this.$emit('input', form)
      setTimeout(() => {
        this.visible = false
      }, 100)
      this.$log.debug('Auto push form:', form)
    }
  }
}
</script>

<style scoped>
</style>
