<template>
  <DataForm
    v-if="!loading"
    ref="dataForm"
    :fields="totalFields"
    :form="iForm"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <span
      v-for="(group, i) in groups"
      :slot="'id:'+group.name"
      :key="'group-'+group.name"
    >
      <FormGroupHeader
        v-if="!groupHidden(group, i)"
        :group="group"
        :index="i"
        :line="i !== 0"
      />
    </span>
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
    async optionUrlMetaAndGenerateColumns() {
      let data = { actions: {}}
      if (this.url) {
        data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      }
      this.remoteMeta = data.actions[this.method.toUpperCase()] || {}
      this.generateColumns()
      this.cleanFormValue()
      this.loading = false
      console.log('Loading: ', this.groups)
    },
    generateColumns() {
      const generator = new FormFieldGenerator()
      this.totalFields = generator.generateFields(this.fields, this.fieldsMeta, this.remoteMeta)
      this.groups = generator.groups
      this.$log.debug('Total fields: ', this.totalFields)
    },
    _cleanFormValue(form, remoteMeta) {
      for (const [k, v] of Object.entries(remoteMeta)) {
        if (v.default === undefined) {
          continue
        }
        const valueSet = form[k]
        if (valueSet !== undefined) {
          continue
        }
        if (v.type === 'nested object' && typeof valueSet === 'object') {
          this._cleanFormValue(valueSet, v.children)
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
    },
    groupHidden(group, i) {
      for (const field of group.fields) {
        let hidden = field.hidden
        if (typeof hidden === 'function') {
          hidden = hidden(this.iForm)
        }
        if (!hidden) {
          return false
        }
      }
      return true
    }
  }
}
</script>

<style scoped>

</style>
