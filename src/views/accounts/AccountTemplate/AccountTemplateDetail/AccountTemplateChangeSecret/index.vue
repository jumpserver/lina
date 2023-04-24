<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="24" :sm="24">
        <el-alert type="success">
          {{ $t('assets.InheritPlatformConfig') }}
        </el-alert>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :md="14" :sm="24">
        <GenericListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :md="10" :sm="24">
        <QuickActions :actions="quickActions" type="primary" />
      </el-col>
      <ViewSecret
        v-if="showViewSecretDialog"
        :account="account"
        :url="secretUrl"
        :visible.sync="showViewSecretDialog"
      />
      <AccountTemplateChangeSecretDialog
        :visible.sync="visible"
        :template="object"
      />
    </el-row>
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import QuickActions from '@/components/QuickActions'
import AccountTemplateChangeSecretDialog from '@/components/AccountTemplateChangeSecretDialog'
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import ViewSecret from '@/components/AccountListTable/ViewSecret'

export default {
  name: 'AccountTemplateChangeSecret',
  components: {
    ViewSecret,
    QuickActions,
    GenericListTable,
    AccountTemplateChangeSecretDialog
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      visible: false,
      secretUrl: '',
      showViewSecretDialog: false,
      quickActions: [
        {
          // title: this.$t('assets.TestAssetsConnective'),
          title: '更新密文',
          attrs: {
            type: 'primary',
            // label: this.$t('assets.Test')
            label: '更新'
          },
          callbacks: Object.freeze({
            click: () => {
              vm.visible = true
            }
          })
        }
      ],
      tableConfig: {
        url: `/api/v1/accounts/accounts/?source_id=${this.object.id}`,
        columns: [
          'name', 'asset', 'secret_type', 'is_active', 'date_created'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetAccountDetail',
              can: vm.$hasPerm('accounts.view_account')
            }
          },
          asset: {
            label: this.$t('assets.Asset'),
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link to={to}>{row.asset.name}</router-link>
              } else {
                return <span>{row.asset.name}</span>
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  can: this.$hasPerm('accounts.view_accountsecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.secretUrl = `/api/v1/accounts/account-secrets/${row.id}/`
                    vm.account = row
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                }
              ]
            }
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: false,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        searchConfig: {
          getUrlQuery: false
        },
        hasMoreActions: false
      }
    }
  }
}
</script>

<style scoped>
.cell a {
  color: var(--color-info);
}
</style>
