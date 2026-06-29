<template>
  <Page v-bind="$attrs" :help-tip="helpMsg">
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :quick-filters="quickFilter"
      :create-drawer="createDrawer"
    />
    <PermBulkUpdateDialog
      v-bind="updateSelectedDialogSetting"
      v-model:visible="updateSelectedDialogSetting.visible"
      @update="handlePermBulkUpdate"
    />
  </Page>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import Page from '@/layout/components/Page'
import { mapGetters } from 'vuex'
import { AssetPermissionListPageSearchConfigOptions, AssetPermissionTableMeta } from '../const.js'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'

export default {
  components: {
    Page,
    AssetTreeTable,
    PermBulkUpdateDialog
  },
  data() {
    return {
      createDrawer: () => import('./AssetPermissionCreateUpdate.vue'),
      helpMsg: this.$t('AssetPermissionHelpMsg'),
      quickFilter: [
        {
          label: this.$t('QuickFilter'),
          options: [
            {
              label: this.$t('Invalid'),
              filter: {
                is_valid: false
              }
            },
            {
              label: this.$t('Valid'),
              filter: {
                is_valid: true
              }
            },
            {
              label: this.$t('Expired'),
              filter: {
                is_expired: true
              }
            },
            {
              label: this.$t('Disabled'),
              filter: {
                is_active: false
              }
            },
            {
              label: this.$t('NoResource'),
              filter: {
                is_no_resource: true
              }
            }
          ]
        }
      ],
      treeSetting: {
        showMenu: false,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1&asset_amount=0',
        edit: {
          drag: {
            isMove: false
          }
        }
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasTree: true,
        columnsExtra: ['action'],
        columns: [
          'name',
          'users_amount',
          'user_groups_amount',
          'assets_amount',
          'nodes_amount',
          'accounts',
          'labels',
          'is_valid',
          'is_expired',
          'from_ticket',
          'is_active',
          'actions',
          'date_created',
          'date_start',
          'date_expired',
          'created_by'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            'users_amount',
            'user_groups_amount',
            'assets_amount',
            'nodes_amount',
            'accounts',
            'is_valid',
            'actions'
          ]
        },
        columnsMeta: {
          ...AssetPermissionTableMeta,
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/asset-permissions/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        hasBulkDelete: true,
        searchConfig: {
          url: '',
          options: AssetPermissionListPageSearchConfigOptions
        },
        hasBulkUpdate: true,
        handleBulkUpdate: ({ selectedRows }) => {
          this.updateSelectedDialogSetting.selectedRows = selectedRows
          this.updateSelectedDialogSetting.visible = true
        }
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      },
      activatedReloadTimer: null
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  activated() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = setTimeout(() => {
      this.reloadAssetTreeTable()
    }, 500)
  },
  deactivated() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  beforeUnmount() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  methods: {
    reloadAssetTreeTable() {
      this.$refs.AssetTreeTable?.reloadTable?.()
    },
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.reloadAssetTreeTable()
    }
  }
}
</script>
