<template>
  <div>
    <BaseList ref="AssetBaseList" v-bind="tableConfig" />
    <AddAssetDialog :object="object" :setting="AddAssetSetting" @close="handleAddAssetDialogClose" />
  </div>
</template>

<script>
import BaseList from '../../Asset/AssetList/components/BaseList'
import AddAssetDialog from '@/views/assets/Domain/components/AddAssetDialog.vue'

export default {
  components: {
    AddAssetDialog,
    BaseList
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      tableConfig: {
        category: 'all',
        url: `/api/v1/assets/assets/?domain=${this.$route.params.id}&is_gateway=0`,
        tableConfig: {
          columnsMeta: {
            actions: {
              formatterArgs: {
                hasDelete: false
              }
            }
          }
        },
        headerActions: {
          hasCreate: false,
          hasRefresh: true,
          hasExport: false,
          hasImport: false,
          hasMoreActions: true,
          hasBulkDelete: false,
          extraActions: [
            {
              name: 'AddAsset',
              title: this.$t('Add'),
              type: 'primary',
              callback: function() {
                this.AddAssetSetting.AddAssetDialogVisible = true
              }.bind(this)
            }
          ]
        },
        addExtraMoreActions: [
          {
            name: this.$t('RemoveSelected'),
            title: this.$t('RemoveSelected'),
            type: 'primary',
            icon: 'fa fa-minus',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: function(rows) {
              this.removeAsset(rows)
            }.bind(this)
          }
        ],
        addExtraMoreColActions: [
          {
            order: 10,
            name: 'RemoveAsset',
            title: this.$t('Remove'),
            callback: function(row) {
              this.removeAsset(row)
            }.bind(this)
          }
        ]
      },
      AddAssetSetting: {
        AddAssetDialogVisible: false
      }
    }
  },
  methods: {
    handleAddAssetDialogClose() {
      this.AddAssetSetting.AddAssetDialogVisible = false
      this.reloadTable()
    },
    removeAsset(rows) {
      let patch_data
      let msg
      if (rows.hasOwnProperty('selectedRows')) {
        patch_data = rows.selectedRows.map(row => {
          return {
            id: row.id,
            domain: null
          }
        })
        msg = patch_data.length + ' ' + this.$t('Rows')
      } else {
        patch_data = [{
          id: rows.row.id,
          domain: null
        }]
        msg = rows.row.name
      }
      this.$confirm(this.$t('removeWarningMsg') + ' ' + msg + ' ?', {
        type: 'warning'
      }).then(() => {
        this.$axios.patch(`/api/v1/assets/assets/`, patch_data).then(() => {
          this.reloadTable()
          this.$message.success(this.$t('RemoveSuccessMsg'))
        })
      }).catch(() => {
      })
    },
    reloadTable() {
      this.$refs.AssetBaseList.$refs.ListTable.reloadTable()
    }
  }
}
</script>
