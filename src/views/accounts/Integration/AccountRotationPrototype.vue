<template>
  <div class="application-credential-list">
    <ListTable ref="credentialTable" :header-actions="headerActions" :table-config="tableConfig" />

    <Drawer
      v-model:visible="drawerVisible"
      :has-footer="false"
      :title="drawerTitle"
      @closed="refreshListIfNeeded"
    >
      <AccountRotationCreateUpdate
        v-if="drawerMode === 'form'"
        :credential="editingCredential"
        :mode="mode"
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
import ListTable from '@/components/Table/ListTable'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import Drawer from '@/components/Drawer/index.vue'
import {
  deleteApplicationCredential,
  credentialUrl,
  getApplicationCredential,
  requestCredentialTable
} from '@/api/applicationCredential'
import AccountRotationCreateUpdate from './AccountRotationCreateUpdate.vue'
import AccountRotationDetail from './AccountRotationDetail/index.vue'
import { credentialStatusLabel } from './components/credentialStatus.js'
import { credentialAssetLabels, subscribedAccountLabel } from './components/subscriptionAccount.js'

export default {
  name: 'ApplicationCredentialList',
  components: {
    AccountRotationCreateUpdate,
    AccountRotationDetail,
    Drawer,
    ListTable
  },
  props: {
    mode: { type: String, required: true }
  },
  data() {
    return {
      drawerMode: 'detail',
      drawerVisible: false,
      editingCredential: null,
      listRefreshPending: false,
      selectedCredential: null,
      tableConfig: {
        name: this.mode === 'alternating_rotation' ? 'PAMAccountRotationList' : undefined,
        url: credentialUrl,
        request: (url, config) =>
          requestCredentialTable(url, {
            ...config,
            params: { ...config?.params, mode: this.mode }
          }),
        extraQuery: { mode: this.mode },
        hasSelection: true,
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
                  {this.mode === 'subscription'
                    ? this.$t(row.is_active ? 'Enabled' : 'Disabled')
                    : credentialStatusLabel(row, this.$t)}
                </el-tag>
              </el-tooltip>
            )
          },
          ...(this.mode === 'subscription'
            ? [
                {
                  prop: 'account_scope',
                  label: this.$t('CredentialPolicyAccountScope'),
                  minWidth: '300px',
                  formatter: (row) => this.renderSubscriptionAccounts(row)
                }
              ]
            : [
                {
                  prop: 'asset',
                  label: this.$t('Asset'),
                  minWidth: '180px',
                  formatter: (row) =>
                    this.renderRotationValue(
                      row,
                      row.asset?.name || row.asset?.address || '-',
                      credentialAssetLabels(row).join(', ') || '-'
                    )
                },
                {
                  prop: 'active_account',
                  label: this.$t('CurrentAccount'),
                  minWidth: '180px',
                  formatter: (row) => this.renderRotationAccount(row, row.active_account)
                },
                {
                  prop: 'next_account',
                  label: this.$t('PendingRotationAccount'),
                  minWidth: '180px',
                  formatter: (row) =>
                    this.renderRotationAccount(
                      row,
                      row.active_account?.id === row.account?.id
                        ? row.alternate_account
                        : row.account
                    )
                }
              ]),
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
      const action = this.$t(this.editingCredential ? 'Update' : 'Create')
      const type = this.$t(
        this.mode === 'subscription' ? 'CredentialUpdateSubscription' : 'AlternatingAccountRotation'
      )
      return `${action} · ${type}`
    }
  },
  deactivated() {
    this.drawerVisible = false
  },
  watch: {
    '$route.query.credential_id': {
      immediate: true,
      handler(id) {
        const tab = this.mode === 'subscription' ? 'notifications' : 'rotations'
        if (id && this.$route.query.tab === tab) this.openDetail({ id })
      }
    }
  },
  methods: {
    renderSubscriptionAccounts(row) {
      const accountName = (account) => account?.username || account?.name || '-'
      const accounts = row.subscription_accounts_preview || []
      const remaining = Math.max(0, (row.subscription_accounts_amount ?? 0) - accounts.length)
      const summary = row.subscription_all_authorized
        ? this.$t('AllApplicationAccounts')
        : accounts.map(accountName).join(', ') || '-'
      return (
        <el-tooltip
          placement="top"
          trigger={['hover', 'focus']}
          disabled={row.subscription_all_authorized}
          v-slots={{
            content: () => (
              <div>
                {accounts.map((account) => (
                  <div key={account.id}>{subscribedAccountLabel(account)}</div>
                ))}
                <div>
                  {this.$t('CredentialPolicyScopeSummary', {
                    accounts: row.subscription_accounts_amount ?? 0,
                    assets: row.subscription_assets_amount ?? 0
                  })}
                </div>
              </div>
            )
          }}
        >
          <button
            type="button"
            class="credential-account-summary truncate-content"
            onClick={() => this.openDetail(row)}
          >
            <span class="credential-account-names">{summary}</span>
            {!row.subscription_all_authorized && remaining > 0 && (
              <span class="credential-account-more">+{remaining}</span>
            )}
          </button>
        </el-tooltip>
      )
    },
    renderRotationAccount(row, account) {
      return this.renderRotationValue(
        row,
        account?.username || account?.name || '-',
        subscribedAccountLabel(account)
      )
    },
    renderRotationValue(row, label, tooltip) {
      return (
        <el-tooltip placement="top" trigger={['hover', 'focus']} content={tooltip}>
          <button
            type="button"
            class="credential-account-summary truncate-content"
            onClick={() => this.openDetail(row)}
          >
            <span class="credential-account-names">{label}</span>
          </button>
        </el-tooltip>
      )
    },
    async loadRows() {
      this.listRefreshPending = false
      return this.$refs.credentialTable.reloadTable()
    },
    refreshListIfNeeded() {
      if (this.listRefreshPending) return this.loadRows()
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
      const credential = await getApplicationCredential(row.id)
      if (credential.mode !== this.mode) {
        return this.$router.replace({
          query: {
            ...this.$route.query,
            tab: credential.mode === 'subscription' ? 'notifications' : 'rotations'
          }
        })
      }
      this.selectedCredential = credential
      this.drawerMode = 'detail'
      this.drawerVisible = true
    },
    async handleSaved(saved) {
      await this.loadRows()
      this.selectedCredential = saved
      this.drawerMode = 'detail'
    },
    handleDetailUpdated(updated) {
      this.selectedCredential = updated
      this.listRefreshPending = true
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

<style lang="scss" scoped>
.application-credential-list {
  :deep(.credential-account-summary) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    line-height: inherit;
    vertical-align: middle;
    cursor: pointer;

    .credential-account-names {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .credential-account-more {
      flex-shrink: 0;
      margin-left: 6px;
      color: var(--color-text-secondary);
    }

    &:hover .credential-account-names {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 1px solid var(--color-link);
      outline-offset: 2px;
    }
  }
}
</style>
