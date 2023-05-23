<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('common.SelectAttrs')"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div v-if="!loading">
      <DataForm
        :form="form"
        class="attr-form"
        v-bind="formConfig"
        @submit="onAttrDialogConfirm"
      />
    </div>
  </Dialog>
</template>

<script>
import DataForm from '@/components/DataForm/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import ValueField from '@/components/FormFields/JSONManyToManySelect/ValueField.vue'
import { attrMatchOptions, typeMatchMapper } from './const'

export default {
  name: 'AttrFormDialog',
  components: { Dialog, DataForm },
  props: {
    attrs: {
      type: Array,
      default: () => ([])
    },
    attrsAdded: {
      type: Array,
      default: () => ([])
    },
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      formConfig: {
        // 为了方便更新，避免去取 fields 的索引
        hasSaveContinue: false,
        fields: [
          {
            id: 'name',
            label: this.$t('common.AttrName'),
            type: 'select',
            options: this.attrs.map(attr => {
              const disabled = this.attrsAdded.includes(attr.name) && this.form.name !== attr.name
              return { label: attr.label, value: attr.name, disabled: disabled }
            }),
            on: {
              change: ([val], updateForm) => {
                const attr = this.attrs.find(attr => attr.name === val)
                if (!attr) return
                this.formConfig.fields[2].el.attr = attr
                const attrType = attr.type || 'str'
                const matchSupports = typeMatchMapper[attrType]
                attrMatchOptions.forEach((option) => {
                  option.hidden = !matchSupports.includes(option.value)
                })
                let defaultValue = ''
                if (['m2m', 'select'].includes(attrType)) {
                  defaultValue = []
                } else if (['bool'].includes(attrType)) {
                  defaultValue = false
                }
                setTimeout(() => {
                  updateForm({ match: matchSupports[0], value: defaultValue })
                }, 0.1)
              }
            }
          },
          {
            id: 'match',
            label: this.$t('common.Match'),
            type: 'select',
            options: attrMatchOptions,
            on: {
              change: ([value], updateForm) => {
                let defaultValue = ''
                if (['in', 'ip_in'].includes(value)) {
                  defaultValue = []
                }
                updateForm({ value: defaultValue })
                this.formConfig.fields[2].el.match = value
              }
            }
          },
          {
            id: 'value',
            label: this.$t('common.AttrValue'),
            component: ValueField,
            el: {
              match: attrMatchOptions[0].value,
              attr: this.attrs[0]
            }
          }
        ]
      }
    }
  },
  mounted() {
    if (this.form.index === undefined || this.form.index === -1) {
      Object.assign(this.form, this.getDefaultAttrForm())
    }
    this.formConfig.fields[2].el.attr = this.attrs.find(attr => attr.name === this.form.name)
    this.formConfig.fields[2].el.match = this.form.match
    this.$log.debug('Form config: ', this.formConfig)
    this.loading = false
  },
  methods: {
    getDefaultAttrForm() {
      const attrKeys = this.attrs.map(attr => attr.name)
      const diff = attrKeys.filter(attr => !this.attrsAdded.includes(attr))
      let name = this.attrs[0].name
      if (diff.length > 0) {
        name = diff[0]
      }
      return {
        name: name,
        match: 'exact',
        value: '',
        rel: 'and'
      }
    },
    onAttrDialogConfirm(form) {
      this.$emit('confirm', form)
    }
  }
}
</script>

<style lang="scss" scoped>

.attr-form {
  >>> .el-select {
    width: 100%;
  }
}
</style>

