<template>
  <DataForm ref="dataForm" v-loading="loading" :fields="totalFields" :form="iForm" v-bind="$attrs" v-on="$listeners">
    <FormGroupHeader
      v-for="(group, i) in groups"
      :slot="'id:'+group.name"
      :key="'group-'+group.name"
      :group="group"
      :index="i"
      :line="i !== 0"
    />
  </DataForm>
</template>

<script>
import DataForm from '../DataForm'
import FormGroupHeader from '@/components/FormGroupHeader'
import { FormFieldGenerator } from '@/components/AutoDataForm/utils'
export default {
  name: 'AutoDataForm',
  components: {
    DataForm,
    FormGroupHeader
  },
  props: {
    url: {
      type: String,
      required: true
    },
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    form: {
      type: Object,
      default: () => ({})
    },
    fieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      remoteMeta: {},
      totalFields: [],
      loading: true,
      groups: [],
      iForm: this.form,
      errors: {}
    }
  },
  mounted() {
    this.optionUrlMetaAndGenerateColumns()
  },
  methods: {
    optionUrlMetaAndGenerateColumns() {
      this.$store.dispatch('common/getUrlMeta', { url: this.url }).then(data => {
        this.remoteMeta = data.actions[this.method.toUpperCase()] || {}
        this.generateColumns()
        this.cleanFormValue()
      }).catch(err => {
        this.$log.error(err)
      }).finally(() => {
        this.loading = false
      })
    },
    generateColumns() {
      const generator = new FormFieldGenerator()
      this.totalFields = generator.generateFields(this.fields, this.fieldsMeta, this.remoteMeta)
      this.groups = generator.groups
      this.$log.debug('Total fields: ', this.totalFields)
    },
    _cleanFormValue(form, remoteMeta) {
      for (const [k, v] of Object.entries(remoteMeta)) {
        let valueSet = form[k]
        if (v.type === 'nested object' && v.children) {
          // 有一些字段属性时 nested object 类型，但是没有 children，没有children的不需要走递归逻辑，
          // 比如：认证配置中的属性映射字段
          if (typeof valueSet !== 'object') {
            // 处理一些前端没有设置初始值的情况
            valueSet = {}
          }
          form[k] = valueSet
          this._cleanFormValue(valueSet, v.children)
        }
        if (valueSet !== undefined) {
          continue
        }
        if (v.default === undefined) {
          continue
        }
        form[k] = v.default
      }
    },
    cleanFormValue() {
      this._cleanFormValue(this.iForm, this.remoteMeta)
    },
    setFieldError(name, error) {
      const field = this.totalFields.find((v) => v.prop === name)
      if (!field) {
        return
      }
      if (field.attrs.error === error) {
        error += '.'
      }
      if (field.type === 'nestedField') {
        field.el.errors = error
      } else {
        field.attrs.error = error
      }
    }
  }
}
</script>

<style scoped>

</style>
