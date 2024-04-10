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
        getUrl: () => {
          return '/api/v1/assets/assets/'
        },
        submitMethod: () => 'patch',
        hasReset: false,
        hasSaveContinue: false,
        needGetObjectDetail: false,
        createSuccessMsg: this.$t('common.AddSuccessMsg'),
        updateSuccessNextRoute: {
          name: 'DomainDetail',
          params: { id: this.$route.params.id }
        },
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
                return row.platform?.name !== 'Gateway' && this.object.assets.map(item => item.id).indexOf(row.id) === -1
              }
            }
          }
        },
        cleanFormValue(values) {
          const data = []
          values.assets.forEach(item => {
            const d = { id: item, domain: this.$route.params.id }
            data.push(d)
          })
          return data
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
