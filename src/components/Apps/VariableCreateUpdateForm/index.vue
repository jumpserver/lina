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
// import { encryptPassword } from '@/utils/crypto'
// import Select2 from '@/components/Form/FormFields/Select2.vue'
// import { Required } from '@/components/Form/DataForm/rules'

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
    },
    // 默认组件密码加密
    encryptPassword: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      submitBtnText: this.$t('Confirm'),
      url: '/api/v1/ops/variable/',
      form: Object.assign({ 'on_invalid': 'error' }, this.variable || {}),
      encryptedFields: ['secret'],
      fields: [
        ['', ['name', 'var_name', 'type', 'default_value', 'tips', 'required']]
      ],
      fieldsMeta: {},
      hasSaveContinue: false
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
