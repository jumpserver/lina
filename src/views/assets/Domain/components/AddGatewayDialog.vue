<template>
  <Dialog
    v-if="setting.AddGatewayDialogVisible"
    :title="$tc('assets.AddGatewayInDomain')"
    :visible.sync="setting.AddGatewayDialogVisible"
    :show-cancel="false"
    :show-confirm="false"
    custom-class="asset-select-dialog"
    width="50vw"
    top="15vh"
    after
    :destroy-on-close="true"
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
        return { AddGatewayDialogVisible: false }
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
        url: `/api/v1/assets/assets/?domain=${this.$route.params.id}&platform=Gateway`,
        getUrl: () => {
          return `/api/v1/assets/domains/${this.$route.params.id}/`
        },
        submitMethod: () => 'patch',
        hasReset: false,
        hasSaveContinue: false,
        createSuccessMsg: this.$t('common.AddSuccessMsg'),
        fields: ['gateways'],
        fieldsMeta: {
          gateways: {
            component: ObjectSelect2,
            el: {
              multiple: true,
              clearable: true,
              ajax: {
                url: '/api/v1/assets/assets/?domain_enabled=true&platform=Gateway'
              }
            }
          }
        }
      }
    }
  },
  methods: {
    onSubmitSuccess(res) {
      this.setting.AddGatewayDialogVisible = false
      this.$emit('close', res)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog ::v-deep form {
  padding: 0 40px;
}

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
