<template>
  <!--
    THESIS: One operational list makes fixed access and manual rotation peers instead of forcing every credential into a rotation workflow.
    OWN-WORLD: Lina's neutral working surface, compact tables, primary actions, restrained status tags, resizable drawers, and existing card hierarchy.
    STORY: Administrators scan credential type and account state, open one detail, then create, edit, or manually rotate without leaving PAM application management.
    FIRST VIEWPORT: Lina's shared list toolbar places Create on the left and the standard search on the right.
    FORM: Existing Lina tabbed-resource extension; one mode-controlled drawer for create, edit, and detail.
    FINISH: The build ends with a closed independent review and runnable checks; it adds no new visual system or raster assets.
  -->
  <div class="application-credential-list">
    <ListTable ref="credentialTable" :header-actions="headerActions" :table-config="tableConfig" />

    <Drawer v-model:visible="drawerVisible" :has-footer="false" :title="drawerTitle">
      <AccountRotationCreateUpdate
        v-if="drawerMode === 'form'"
        :credential="editingCredential"
        @cancel="drawerVisible = false"
        @saved="handleSaved"
      />
      <AccountRotationDetail
        v-else-if="selectedCredential"
        :object="selectedCredential"
        @edit="openEdit"
        @updated="handleDetailUpdated"
      />
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import Drawer from '@/components/Drawer/index.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import {
  deleteApplicationCredential,
  credentialUrl,
  getApplicationCredential,
  requestCredentialTable
} from '@/api/applicationCredential'
import AccountRotationCreateUpdate from './AccountRotationCreateUpdate.vue'
import AccountRotationDetail from './AccountRotationDetail/index.vue'

const accountName = (row) => row.published_account?.username || row.published_account?.name || '-'

export default {
  name: 'ApplicationCredentialList',
  components: {
    AccountRotationCreateUpdate,
    AccountRotationDetail,
    Drawer,
    ListTable
  },
  data() {
    return {
      drawerMode: 'detail',
      drawerVisible: false,
      editingCredential: null,
      selectedCredential: null,
      tableConfig: {
        url: credentialUrl,
        request: requestCredentialTable,
        hasSelection: false,
        hasPagination: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('Name'),
            minWidth: '190px',
            formatter: DetailFormatter,
            formatterArgs: {
              onClick: ({ row }) => this.openDetail(row)
            }
          },
          {
            prop: 'type',
            label: this.$t('CredentialType'),
            width: '130px',
            formatter: (row) => this.typeLabel(row)
          },
          {
            prop: 'rotation_mode',
            label: this.$t('RotationMode'),
            width: '130px',
            formatter: (row) => this.rotationModeLabel(row)
          },
          {
            prop: 'asset',
            label: this.$t('Asset'),
            minWidth: '190px',
            formatter: (row) => `${row.asset?.name || '-'} (${row.asset?.address || '-'})`
          },
          {
            prop: 'published_account',
            label: this.$t('CurrentAccount'),
            minWidth: '140px',
            formatter: accountName
          },
          {
            prop: 'last_fetched',
            label: this.$t('LastFetched'),
            width: '175px',
            formatter: (row) => this.formatDate(row.last_fetched)
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            width: '110px',
            formatter: (row) => (
              <el-tag type={row.is_active ? 'success' : 'info'}>
                {row.is_active ? this.$t('Enabled') : this.$t('Disabled')}
              </el-tag>
            )
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            align: 'center',
            width: '130px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              canUpdate: ({ row }) =>
                this.$hasPerm('accounts.change_applicationcredential') && row.status === 'idle',
              canDelete: ({ row }) =>
                this.$hasPerm('accounts.delete_applicationcredential') && row.status === 'idle',
              onUpdate: ({ row }) => this.openEdit(row),
              onDelete: ({ row }) => this.remove(row)
            }
          }
        ]
      }
    }
  },
  computed: {
    headerActions() {
      return {
        hasCreate: this.$hasPerm('accounts.add_applicationcredential'),
        canCreate: this.$hasPerm('accounts.add_applicationcredential'),
        onCreate: this.openCreate,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    },
    drawerTitle() {
      if (this.drawerMode === 'detail') {
        return this.selectedCredential?.name || this.$t('ApplicationCredential')
      }
      return this.editingCredential
        ? this.$t('EditApplicationCredential')
        : this.$t('NewApplicationCredential')
    }
  },
  deactivated() {
    this.drawerVisible = false
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    typeLabel(row) {
      return row.type === 'fixed' ? this.$t('FixedAccount') : this.$t('AccountRotation')
    },
    rotationModeLabel(row) {
      if (row.type === 'fixed') return '-'
      return row.rotation_mode === 'dual'
        ? this.$t('DualAccountRotation')
        : this.$t('SingleAccountRotation')
    },
    async loadRows() {
      return this.$refs.credentialTable.reloadTable()
    },
    openCreate() {
      this.editingCredential = null
      this.drawerMode = 'form'
      this.drawerVisible = true
    },
    async openEdit(row) {
      this.editingCredential = await getApplicationCredential(row.id)
      this.drawerMode = 'form'
      this.drawerVisible = true
    },
    async openDetail(row) {
      this.selectedCredential = await getApplicationCredential(row.id)
      this.drawerMode = 'detail'
      this.drawerVisible = true
    },
    async handleSaved(saved) {
      await this.loadRows()
      this.selectedCredential = saved
      this.drawerMode = 'detail'
    },
    async handleDetailUpdated(updated) {
      this.selectedCredential = updated
      await this.loadRows()
    },
    async remove(row) {
      await this.$confirm(
        this.$t('DeleteApplicationCredentialConfirm', { name: row.name }),
        this.$t('Warning'),
        { type: 'warning' }
      )
      await deleteApplicationCredential(row.id)
      await this.loadRows()
      this.$message.success(this.$t('DeleteSuccessMsg'))
    }
  }
}
</script>
