<template>
  <Page :help-message="`${$t('UserCredentialCountHint')} ${$t('UserCredentialScopeHint')}`">
    <GenericListTable
      :key="orgId"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getMetadata"
      @query-change="closeDetails"
    />
    <Drawer v-model:visible="drawerVisible" :title="drawerTitle" @close-drawer="closeDetails">
      <CredentialDetails
        v-if="selection"
        :key="`${orgId}:${selection.user.id}:${selection.type}`"
        :user="selection.user"
        :credential-type="selection.type"
        :org-id="orgId"
      />
    </Drawer>
  </Page>
</template>

<script>
import { markRaw } from 'vue'
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import CredentialCount from './CredentialCount.vue'
import CredentialDetails from './CredentialDetails.vue'
import Drawer from '@/components/Drawer/index.vue'
import ChoicesFormatter from '@/components/Table/TableFormatters/ChoicesFormatter.vue'

const credentialLabels = {
  ssh_keys: 'SSHKey',
  access_keys: 'AccessKey',
  passkeys: 'Passkey',
  private_token: 'PrivateToken'
}

export default {
  name: 'UserCredentialList',
  components: { Page, GenericListTable, CredentialDetails, Drawer },
  data() {
    return {
      drawerVisible: false,
      selection: null,
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  },
  computed: {
    orgId() {
      return this.$route.query.oid || this.$store.getters.currentOrg?.id || ''
    },
    drawerTitle() {
      if (!this.selection) return this.$t('UserCredentials')
      return `${this.selection.user.name || this.selection.user.username} · ${this.$t(credentialLabels[this.selection.type])}`
    },
    tableConfig() {
      const columnsMeta = {
        actions: { has: false },
        name: {
          label: this.$t('User'),
          minWidth: '200px',
          sortable: false,
          formatter: (row) => (row.name ? `${row.name}(${row.username})` : row.username)
        },
        is_active: {
          label: this.$t('UserCredentialUserStatus'),
          width: '100px',
          formatter: markRaw(ChoicesFormatter),
          formatterArgs: {
            getText: ({ cellValue }) => this.$t(cellValue ? 'UserCredentialEnabled' : 'Disabled')
          }
        }
      }
      for (const [type, label] of Object.entries(credentialLabels)) {
        columnsMeta[type] = {
          label: this.$t(label),
          minWidth: '130px',
          formatter: markRaw(CredentialCount),
          formatterArgs: {
            existsOnly: type === 'private_token',
            onClick: ({ row }) => this.openDetails(row, type)
          }
        }
      }
      return {
        url: '/api/v1/audits/user-credentials/',
        permissions: { app: 'rbac', resource: 'usercredential' },
        columns: ['name', ...Object.keys(credentialLabels), 'is_active'],
        columnsMeta,
        hasSelection: false,
        hasColumnPinning: false,
        axiosConfig: { raw: 1, headers: { 'X-JMS-ORG': this.orgId } }
      }
    }
  },
  watch: {
    orgId() {
      this.closeDetails()
    }
  },
  deactivated() {
    this.closeDetails()
  },
  methods: {
    getMetadata() {
      return Promise.resolve({
        actions: { GET: {} },
        search: {
          param: 'search',
          fields: [
            { name: 'name', label: this.$t('Name'), lookup: 'icontains' },
            { name: 'username', label: this.$t('Username'), lookup: 'icontains' }
          ],
          operators: ['icontains_any', 'icontains_all'],
          default_operator: 'icontains_any'
        }
      })
    },
    openDetails(user, type) {
      this.selection = { user, type }
      this.drawerVisible = true
    },
    closeDetails() {
      this.drawerVisible = false
      this.selection = null
    }
  }
}
</script>
