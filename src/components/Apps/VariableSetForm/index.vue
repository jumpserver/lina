<template>
  <AutoDataForm
    ref="AutoDataForm"
    class="variable-set"
    :submit-btn-text="submitBtnText"
    v-bind="$data"
    :fields="fields"
    @submit="confirm"
  />
</template>

<script>
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'

export default {
  name: 'VariableSetForm',
  components: {
    AutoDataForm
  },
  props: {
    formData: {
      type: Array,
      default: () => ([])
    },
    queryParam: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      submitBtnText: this.$t('Confirm'),
      // 防止缓存form remoteMeta
      url: `/api/v1/ops/variable/form_data/?t=${new Date().getTime()}&` + this.queryParam,
      form: {},
      hasSaveContinue: false,
      method: 'get',
      hasReset: false
    }
  },
  computed: {
    fields() {
      return [['', this.formData.map(item => item.var_name)]]
    }
  },
  methods: {
    confirm(form) {
      this.$emit('confirm', form)
    }
  }
}
</script>

<style lang='scss' scoped>
.variable-set {
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
