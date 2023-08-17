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
import DataForm from '@/components/Form/DataForm/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import ValueField from '@/components/Form/FormFields/JSONManyToManySelect/ValueField.vue'
import { attrMatchOptions, typeMatchMapper } from '@/components/const'

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
    const vm = this
    return {
      loading: true,
      currentValue: '',
      formConfig: {
        // 为了方便更新，避免去取 fields 的索引
        hasSaveContinue: false,
        fields: [
          {
            id: 'name',
            label: this.$t('common.AttrName'),
            type: 'select',
            options: this.attrs.map(attr => {
              let disabled = this.attrsAdded.includes(attr.name) && this.form.name !== attr.name
              if (attr.disabled) {
                disabled = true
              }
              return { label: attr.label, value: attr.name, disabled: disabled }
            }),
            on: {
              change: ([val], updateForm) => {
                // 变化会影响 match 的选项
                const attr = this.attrs.find(attr => attr.name === val)
                if (!attr) return
                const matchOption = vm.updateMatchOptions(attr)
                setTimeout(() => {
                  updateForm({ match: matchOption.value })
                }, 10)
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
                // 变化会影响 value 的选项
                setTimeout(() => {
                  this.formConfig.fields[2].el.match = value
                }, 10)
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
            },
            on: {
              input: ([value], updateForm) => {
                vm.currentValue = value
              }
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
    this.updateMatchOptions()
    this.$log.debug('Attr Form config: ', this.formConfig)
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
    },
    updateMatchOptions(attr) {
      if (!attr) {
        attr = this.attrs.find(attr => attr.name === this.form.name)
      }
      if (!attr) return
      const attrType = attr.type || 'str'
      const matchSupports = typeMatchMapper[attrType]
      attrMatchOptions.forEach((option) => {
        option.hidden = !matchSupports.includes(option.value)
      })
      this.formConfig.fields[2].el.attr = attr
      const supports = attrMatchOptions.filter(option => !option.hidden)
      const matchOption = supports.find(item => item.value === this.form.match) || supports[0]
      this.formConfig.fields[2].el.match = matchOption.value
      return matchOption
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

