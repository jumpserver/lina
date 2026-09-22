<template>
  <!--
    THESIS: One operational list makes update subscriptions and alternating rotations easy to scan and act on.
    OWN-WORLD: Lina's neutral working surface, compact tables, primary actions, restrained status tags, resizable drawers, and existing card hierarchy.
    STORY: Administrators scan policy mode and account state, open one detail, then create, edit, or manually rotate without leaving PAM application management.
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
import { credentialStatusLabel } from './components/credentialStatus.js'

const accountName = (row, t) =>
  row.mode === 'subscription'
    ? t('ApplicationAuthorizedAccounts')
    : row.active_account?.username || row.active_account?.name || '-'

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
            prop: 'mode',
            label: this.$t('CredentialPolicyMode'),
            minWidth: '180px',
            formatter: (row) => this.modeLabel(row)
          },
          {
            prop: 'asset',
            label: this.$t('Asset'),
            minWidth: '190px',
            formatter: (row) =>
              row.mode === 'subscription'
                ? '-'
                : `${row.asset?.name || '-'} (${row.asset?.address || '-'})`
          },
          {
            prop: 'active_account',
            label: this.$t('CurrentAccount'),
            minWidth: '140px',
            formatter: (row) => accountName(row, this.$t)
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
            width: '200px',
            formatter: (row) => (
              <el-tooltip
                content={this.$t('CredentialRotationLockedHelp')}
                disabled={row.status === 'idle'}
              >
                <el-tag
                  type={!row.is_active ? 'info' : row.status === 'idle' ? 'success' : 'warning'}
                  style={{
                    height: 'auto',
                    minHeight: '24px',
                    lineHeight: '20px',
                    whiteSpace: 'normal'
                  }}
                >
                  {credentialStatusLabel(row, this.$t)}
                </el-tag>
              </el-tooltip>
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
  watch: {
    '$route.query.credential_id': {
      immediate: true,
      handler(id) {
        if (id && this.$route.query.tab === 'rotations') this.openDetail({ id })
      }
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    modeLabel(row) {
      return this.$t(
        row.mode === 'alternating_rotation'
          ? 'AlternatingAccountRotation'
          : 'CredentialUpdateSubscription'
      )
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
