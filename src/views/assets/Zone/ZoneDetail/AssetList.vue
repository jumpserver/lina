<template>
  <div>
    <TwoCol>
      <BaseList v-bind="config" ref="AssetBaseList" />
    </TwoCol>
    <AddAssetDialog
      v-if="addAssetSetting.addAssetDialogVisible"
      :object="object"
      :setting="addAssetSetting"
      @close="handleAddAssetDialogClose"
    />
    <AddAssetByCIDRDialog
      v-if="cidrDialogVisible"
      :object="object"
      @close="cidrDialogVisible = false"
      @added="reloadTable"
    />
  </div>
</template>

<script>
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList'
import AddAssetDialog from '@/views/assets/Zone/components/AddAssetDialog.vue'
import AddAssetByCIDRDialog from '@/views/assets/Zone/components/AddAssetByCIDRDialog.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
    BaseList,
    AddAssetDialog,
    AddAssetByCIDRDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      cidrDialogVisible: false,
      config: {
        category: 'all',
        url: `/api/v1/assets/assets/?zone=${this.object.id}&is_gateway=0`,
        tableConfig: {
          columns: ['name', 'address', 'platform', 'actions'],
          columnsMeta: {
            actions: {
              formatterArgs: {
                hasDelete: false
              }
            },
            connectivity: {
              hidden: () => false
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
              title: this.$t('AddAsset'),
              type: 'primary',
              can: !this.$store.getters.currentOrgIsRoot,
              callback: () => {
                this.addAssetSetting.addAssetDialogVisible = true
              }
            },
            {
              name: 'AddAssetByCIDR',
              title: this.$t('AddAssetByCIDR'),
              can: !this.$store.getters.currentOrgIsRoot && this.$hasPerm('assets.change_asset'),
              callback: () => {
                this.cidrDialogVisible = true
              }
            }
          ]
        },
        addExtraMoreActions: [
          {
            name: this.$t('RemoveSelected'),
            title: this.$t('RemoveSelected'),
            type: 'primary',
            icon: 'fa-solid fa-minus',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: function (rows) {
              this.removeAsset(rows)
            }.bind(this)
          }
        ],
        addExtraMoreColActions: [
          {
            order: 10,
            name: 'RemoveAsset',
            title: this.$t('Remove'),
            callback: function (row) {
              this.removeAsset(row)
            }.bind(this)
          }
        ]
      },
      addAssetSetting: {
        addAssetDialogVisible: false
      }
    }
  },
  methods: {
    handleAddAssetDialogClose() {
      this.addAssetSetting.addAssetDialogVisible = false
      this.reloadTable()
    },
    removeAsset(rows) {
      let patch_data
      let msg
      if (Object.prototype.hasOwnProperty.call(rows, 'selectedRows')) {
        patch_data = rows.selectedRows.map((row) => {
          return {
            id: row.id,
            zone: null
          }
        })
        msg = patch_data.length + ' ' + this.$t('Rows')
      } else {
        patch_data = [
          {
            id: rows.row.id,
            zone: null
          }
        ]
        msg = rows.row.name
      }
      this.$confirm(this.$t('removeWarningMsg') + ' ' + msg + ' ?', {
        type: 'warning'
      })
        .then(() => {
          this.$axios.patch(`/api/v1/assets/assets/`, patch_data).then(() => {
            this.reloadTable()
            this.$message.success(this.$t('RemoveSuccessMsg'))
          })
        })
        .catch(() => {})
    },
    reloadTable() {
      this.$refs.AssetBaseList.$refs.ListTable.reloadTable()
    }
  }
}
</script>
