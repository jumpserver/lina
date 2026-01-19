<template>
  <div>
    <el-alert type="success">
      {{ $t('AccountTemplateUpdateSecretHelpText') }}
    </el-alert>
    <TwoCol>
      <template>
        <GenericListTable
          ref="listTable"
          :detail-drawer="detailDrawer"
          :header-actions="headerActions"
          :table-config="tableConfig"
        />
      </template>
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
      </template>
    </TwoCol>
    <ViewSecret
      v-if="showViewSecretDialog"
      :account="account"
      :url="secretUrl"
      :visible.sync="showViewSecretDialog"
    />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms/index'
import { GenericListTable } from '@/layout/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret'

export default {
  name: 'AccountTemplateChangeSecret',
  components: {
    TwoCol,
    ViewSecret,
    QuickActions,
    GenericListTable
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
      detailDrawer: () => import('@/views/accounts/AccountDiscover/TaskDetail/index.vue'),
      visible: false,
      secretUrl: '',
      showViewSecretDialog: false,
      quickActions: [
        {
          title: this.$t('SyncUpdateAccountInfo'),
          attrs: {
            type: 'primary',
            label: this.$t('Sync')
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios
                .patch(
                  `/api/v1/accounts/account-templates/${this.object.id}/sync-related-accounts/`
                )
                .then(res => {
                  openTaskPage(res['task'])
                })
            }
          })
        }
      ],
      tableConfig: {
        url: `/api/v1/accounts/accounts/?source_id=${this.object.id}`,
        columns: ['name', 'asset', 'secret_type', 'is_active', 'date_created'],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: vm.$hasPerm('accounts.view_account'),
              getRoute: ({ row }) => {
                this.detailDrawer = () => import('@/views/accounts/Account/AccountDetail/index.vue')
                return {
                  name: 'AccountDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          asset: {
            label: this.$t('Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: vm.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => {
                this.detailDrawer = () => import('@/views/assets/Asset/AssetDetail')
                return {
                  name: 'AssetDetail',
                  params: { id: row.asset.id }
                }
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
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
          getUrlQuery: true,
          exclude: ['asset'],
          options: [
            {
              label: this.$t('AssetName'),
              value: 'asset_name'
            }
          ]
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
