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
    asset: {
      type: Object,
      default: null
    },
    variable: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      submitBtnText: this.$t('Confirm'),
      url: '/api/v1/ops/variable/',
      form: Object.assign({ 'on_invalid': 'error' }, this.variable || {}),
      encryptedFields: ['password_default_value'],
      fields: [
        ['', ['name', 'var_name', 'type', 'text_default_value', 'select_default_value', 'extra_args', 'tips', 'required']]
      ],
      fieldsMeta: {
        text_default_value: {
          label: this.$t('Default Value'),
          hidden: (formValue) => {
            return formValue.type !== 'text'
          },
          el: {
            type: 'input'
          }
        },
        select_default_value: {
          label: this.$t('Default Value'),
          hidden: (formValue) => {
            return formValue.type !== 'select'
          },
          el: { type: 'input' }
        },
        extra_args: {
          hidden: (formValue) => {
            return formValue.type !== 'select'
          },
          el: { type: 'textarea', rows: 4, placeholder: this.$t('每行一个选项，例如：\nval1:值1\nval2:值2\n') }
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
