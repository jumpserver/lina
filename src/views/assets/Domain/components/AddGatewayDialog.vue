<template>
  <Dialog
    v-if="setting.addGatewayDialogVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddGatewayInDomain')"
    :visible.sync="setting.addGatewayDialogVisible"
    after
    custom-class="asset-select-dialog"
    top="15vh"
    width="50vw"
  >
    <GenericCreateUpdateForm
      v-bind="formConfig"
      @submitSuccess="onSubmitSuccess"
    />
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import ObjectSelect2 from '@/components/Form/FormFields/NestedObjectSelect2.vue'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    setting: {
      type: Object,
      default: () => {
        return { addGatewayDialogVisible: false }
      }
    },
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      formConfig: {
        getUrl: () => {
          return '/api/v1/assets/assets/'
        },
        submitMethod: () => 'patch',
        hasReset: false,
        hasSaveContinue: false,
        needGetObjectDetail: false,
        createSuccessMsg: this.$t('AddSuccessMsg'),
        updateSuccessNextRoute: {
          name: 'ZoneDetail',
          params: { id: this.$route.params.id }
        },
        fields: ['gateways'],
        fieldsMeta: {
          gateways: {
            component: ObjectSelect2,
            label: this.$t('Gateway'),
            el: {
              multiple: true,
              clearable: true,
              ajax: {
                url: '/api/v1/assets/assets/?domain_enabled=true&is_gateway=1'
              },
              disabledValues: this.object.gateways.map(item => item.id)
            }
          }
        },
        cleanFormValue(values) {
          const data = []
          values.gateways.forEach(item => {
            const d = { id: item.pk, domain: this.$route.params.id }
            data.push(d)
          })
          return data
        }
      }
    }
  },
  methods: {
    onSubmitSuccess(res) {
      this.setting.addGatewayDialogVisible = false
      this.$emit('close', res)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog ::v-deep form {
}

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
