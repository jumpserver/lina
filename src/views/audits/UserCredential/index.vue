<template>
  <div>
    <GenericListPage
      v-if="orgId"
      :key="orgId"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getMetadata"
      @query-change="handleQueryChange"
    />
    <Drawer v-model:visible="drawerVisible" :title="drawerTitle" @close-drawer="closeDetails">
      <TabPage
        v-if="selection"
        v-model:active-menu="selection.type"
        :hide-heading="true"
        :submenu="credentialTabs"
        navigation-scope="local"
      >
        <template #headingRightSide>
          <el-button
            link
            :aria-label="$t('Refresh')"
            :title="$t('Refresh')"
            :disabled="!detail || detail.loading"
            @click="detail.reload()"
          >
            <Icon icon="refresh" />
          </el-button>
        </template>
        <CredentialDetails
          :key="`${orgId}:${selection.user.id}:${selection.type}`"
          ref="detail"
          :user="selection.user"
          :credential-type="selection.type"
          :org-id="orgId"
        />
      </TabPage>
    </Drawer>
  </div>
</template>

<script>
import { markRaw, useTemplateRef } from 'vue'
import TabPage from '@/layout/components/TabPage'
import GenericListPage from '@/layout/components/GenericListPage'
import CredentialCount from './CredentialCount.vue'
import CredentialDetails from './CredentialDetails.vue'
import Drawer from '@/components/Drawer/index.vue'
import Icon from '@/components/Widgets/Icon'
import ChoicesFormatter from '@/components/Table/TableFormatters/ChoicesFormatter.vue'

const credentialLabels = {
  ssh_keys: 'SSHKey',
  access_keys: 'AccessKey',
  passkeys: 'Passkey',
  private_token: 'PrivateToken'
}

function userLabel(user) {
  return user.name && user.name !== user.username
    ? `${user.name} (${user.username})`
    : user.username
}

export default {
  name: 'UserCredentialList',
  components: { GenericListPage, TabPage, CredentialDetails, Drawer, Icon },
  setup() {
    return { detail: useTemplateRef('detail') }
  },
  data() {
    return {
      hasSearchQuery: false,
      drawerVisible: false,
      selection: null
    }
  },
  computed: {
    headerActions() {
      return {
        hasLeftActions: false,
        hasExport: this.$hasPerm('rbac.view_usercredential'),
        hasImport: false,
        hasMoreActions: false
      }
    },
    orgId() {
      return this.$route.query.oid || this.$store.getters.currentOrg?.id || ''
    },
    drawerTitle() {
      return this.selection ? userLabel(this.selection.user) : this.$t('UserCredentials')
    },
    credentialTabs() {
      return Object.entries(credentialLabels).map(([name, label]) => ({
        name,
        title: this.$t(label)
      }))
    },
    tableConfig() {
      const columnsMeta = {
        actions: { has: false },
        name: {
          label: this.$t('User'),
          minWidth: '170px',
          sortable: false,
          formatter: userLabel
        },
        is_active: {
          label: this.$t('UserCredentialUserStatus'),
          width: '130px',
          formatter: markRaw(ChoicesFormatter),
          formatterArgs: {
            getText: ({ cellValue }) => this.$t(cellValue ? 'UserCredentialEnabled' : 'Disabled')
          }
        }
      }
      for (const [type, label] of Object.entries(credentialLabels)) {
        columnsMeta[type] = {
          label: this.$t(label),
          minWidth: type === 'passkeys' ? '110px' : '130px',
          formatter: markRaw(CredentialCount),
          formatterArgs: {
            existsOnly: type === 'private_token',
            onClick: ({ row }) => this.openDetails(row, type)
          }
        }
      }
      return {
        // Browser downloads use this URL directly, outside the Axios org header.
        url: `/api/v1/audits/user-credentials/?oid=${encodeURIComponent(this.orgId)}`,
        permissions: { app: 'rbac', resource: 'usercredential' },
        columns: ['name', 'is_active', ...Object.keys(credentialLabels)],
        columnsShow: { min: ['name'] },
        loadErrorMessage: this.$t('UserCredentialListLoadFailed'),
        tableAttrs: {
          emptyText: this.$t(
            this.hasSearchQuery ? 'UserCredentialNoMatches' : 'UserCredentialNoUsers'
          )
        },
        columnsMeta,
        axiosConfig: { raw: 1, disableFlashErrorMsg: true, headers: { 'X-JMS-ORG': this.orgId } }
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
    handleQueryChange(query) {
      this.hasSearchQuery = Object.keys(query).length > 0
      this.closeDetails()
    },
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
