<template>
  <Dialog
    v-if="setting.AddAssetDialogVisible"
    :title="$tc('assets.AddAssetInDomain')"
    :visible.sync="setting.AddAssetDialogVisible"
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
import AssetSelect from '@/components/Apps/AssetSelect/index.vue'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    setting: {
      type: Object,
      default: () => {
        return { AddAssetDialogVisible: false }
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
        url: `/api/v1/assets/assets/?domain=${this.$route.params.id}&exclude_platform=Gateway`,
        getUrl: () => {
          return `/api/v1/assets/domains/${this.$route.params.id}/`
        },
        submitMethod: () => 'patch',
        hasReset: false,
        hasSaveContinue: false,
        createSuccessMsg: this.$t('common.AddSuccessMsg'),
        fields: ['assets'],
        fieldsMeta: {
          assets: {
            type: 'assetSelect',
            component: AssetSelect,
            label: this.$t('assets.Assets'),
            el: {
              value: [],
              baseUrl: '/api/v1/assets/assets/?domain_enabled=true',
              treeUrlQuery: {
                domain_enabled: true
              },
              canSelect: (row) => {
                return row.platform?.name !== 'Gateway'
              }
            }
          }
        }
      }
    }
  },
  methods: {
    onSubmitSuccess(res) {
      this.setting.AddAssetDialogVisible = false
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
