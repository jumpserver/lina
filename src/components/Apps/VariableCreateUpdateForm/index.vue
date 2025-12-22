<template>
  <AutoDataForm
    ref="AutoDataForm"
    class="variable-add"
    :submit-btn-text="submitBtnText"
    v-bind="$data"
    @submit="confirm"
  />
</template>

<script>
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'

export default {
  name: 'VariableCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    variable: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const defaultValidator = (rule, value, callback) => {
      if (this.defaultValueRequired && !value) {
        callback(new Error(this.$t('FieldRequiredError')))
      } else {
        callback()
      }
    }
    return {
      defaultValueRequired: false,
      submitBtnText: this.$t('Confirm'),
      url: '/api/v1/ops/variables/',
      form: Object.assign({ 'on_invalid': 'error' }, this.variable || {}),
      fields: [
        ['', ['name', 'var_name', 'type', 'text_default_value', 'select_default_value', 'extra_args', 'tips', 'required']]
      ],
      fieldsMeta: {
        var_name: {
          helpTextAsTip: false
        },
        text_default_value: {
          label: this.$t('DefaultValue'),
          hidden: (formValue) => {
            return formValue.type !== 'text'
          },
          rules: [{ validator: defaultValidator }],
          helpTip: this.$t('DefaultValueTip'),
          el: {
            type: 'input'
          }
        },
        select_default_value: {
          label: this.$t('DefaultValue'),
          helpTip: this.$t('DefaultValueTip'),
          hidden: (formValue) => {
            return formValue.type !== 'select'
          },
          rules: [{ validator: defaultValidator }],
          el: { type: 'input' }
        },
        extra_args: {
          hidden: (formValue) => {
            return formValue.type !== 'select'
          },
          el: { type: 'textarea', rows: 4, placeholder: this.$t('ExtraArgsPlaceholder') },
          rules: [
            {
              validator: (rule, value, callback) => {
                try {
                  const lines = value.split('\n')
                  const regex = /^[^:]+:[^:]+$/
                  for (const line of lines) {
                    if (!regex.test(line.trim())) {
                      callback(new Error(this.$t('ExtraArgsFormatError')))
                    }
                  }
                } catch (e) {
                  callback(new Error(this.$t('ExtraArgsFormatError')))
                }
                callback()
              }
            }
          ]
        },
        required: {
          on: {
            change: ([event], updateForm) => {
              this.defaultValueRequired = event
            }
          }
        }
      },
      hasSaveContinue: false,
      method: 'get'
    }
  },
  mounted() {
    this.defaultValueRequired = this.variable?.required || false
  },
  methods: {
    confirm(form) {
      if (this.variable?.name) {
        this.$emit('edit', form)
      } else {
        this.$emit('add', form)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.variable-add {
  :deep(.el-form-item) {
    margin-bottom: 5px;

    .help-block {
      margin-bottom: 5px;
    }
  }

  :deep(.form-group-header) {
    .hr-line-dashed {
      margin: 5px 0;
    }

    h3 {
      margin-bottom: 10px;
    }
  }
}
</style>
