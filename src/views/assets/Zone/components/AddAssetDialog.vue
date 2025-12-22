<template>
  <Dialog
    v-if="setting.addAssetDialogVisible"
    :destroy-on-close="true"
    :modal="false"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddAssetInZone')"
    :visible.sync="setting.addAssetDialogVisible"
    after
    custom-class="asset-select-dialog"
    top="15vh"
    width="600px"
  >
    <GenericCreateUpdateForm
      v-bind="formConfig"
      @submit-success="onSubmitSuccess"
    />
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import { Select2 } from '@/components'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    setting: {
      type: Object,
      default: () => {
        return { addAssetDialogVisible: false }
      }
    },
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
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

        fields: ['assets'],
        fieldsMeta: {
          assets: {
            label: this.$t('Assets'),
            component: Select2,
            type: 'select2',
            el: {
              value: [],
              url: '/api/v1/assets/assets/',
              canSelect: (row) => {
                return !row.platform?.name.startsWith('Gateway') && this.object.assets.map(item => item.id).indexOf(row.id) === -1
              }
            }
          }
        },
        cleanFormValue(values) {
          const data = []
          values.assets.forEach(item => {
            const d = { id: item, zone: vm.object.id }
            data.push(d)
          })
          return data
        }
      }
    }
  },
  methods: {
    onSubmitSuccess(res) {
      this.setting.addAssetDialogVisible = false
      this.$emit('close', res)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog :deep(.el-dialog__footer) {
  padding: 0;
}
</style>
