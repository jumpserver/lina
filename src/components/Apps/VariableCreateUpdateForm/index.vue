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
    return {
      submitBtnText: this.$t('Confirm'),
      url: '/api/v1/ops/variable/',
      form: Object.assign({ 'on_invalid': 'error' }, this.variable || {}),
      fields: [
        ['', ['name', 'var_name', 'type', 'text_default_value', 'select_default_value', 'extra_args', 'tips', 'required']]
      ],
      fieldsMeta: {
        text_default_value: {
          label: this.$t('DefaultValue'),
          hidden: (formValue) => {
            return formValue.type !== 'text'
          },
          el: {
            type: 'input'
          }
        },
        select_default_value: {
          label: this.$t('DefaultValue'),
          hidden: (formValue) => {
            return formValue.type !== 'select'
          },
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
                const lines = value.split('\n')
                const regex = /^[^:]+:[^:]+$/
                for (const line of lines) {
                  if (!regex.test(line.trim())) {
                    callback(new Error(this.$t('ExtraArgsFormatError')))
                  }
                }
                callback()
              }
            }
          ]
        }
      },
      hasSaveContinue: false,
      method: 'get'
    }
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
  ::v-deep .el-form-item {
    margin-bottom: 5px;

    .help-block {
      margin-bottom: 5px;
    }
  }

  ::v-deep .form-group-header {
    .hr-line-dashed {
      margin: 5px 0;
    }

    h3 {
      margin-bottom: 10px;
    }
  }
}
</style>
