<template>
  <Dialog
    v-if="setting.AddAssetDialogVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddAssetInDomain')"
    :visible.sync="setting.AddAssetDialogVisible"
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
        createSuccessMsg: this.$t('AddSuccessMsg'),
        updateSuccessNextRoute: {
          name: 'ZoneDetail',
          params: { id: this.$route.params.id }
        },
        fields: ['assets'],
        fieldsMeta: {
          assets: {
            type: 'assetSelect',
            component: AssetSelect,
            label: this.$t('Asset'),
            el: {
              value: [],
              baseUrl: '/api/v1/assets/assets/?domain_enabled=true',
              treeUrlQuery: {
                domain_enabled: true
              },
              canSelect: (row) => {
                return !row.platform?.name.startsWith('Gateway') && this.object.assets.map(item => item.id).indexOf(row.id) === -1
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
