<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <ViewSecret
      v-if="showViewSecretDialog"
      :account="account"
      :show-password-record="false"
      :url="secretUrl"
      type="template"
      :visible.sync="showViewSecretDialog"
    />

    <Drawer v-if="showTableUpdateDrawer" :title="drawerTitle" @close-drawer="showTableUpdateDrawer = !showTableUpdateDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

import Drawer from '@/components/Drawer/index.vue'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret'
import AccountTemplateDetail from '@/views/accounts/AccountTemplate/AccountTemplateDetail/index.vue'
import AccountTemplateUpdate from '@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'

export default {
  name: 'AccountTemplateList',
  components: {
    Drawer,
    ViewSecret,
    GenericListPage,
    AccountTemplateUpdate,
    AccountTemplateDetail
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      showTableUpdateDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      account: {},
      secretUrl: '',
      tableConfig: {
        url: '/api/v1/accounts/account-templates/',
        columns: null,
        columnsExclude: ['spec_info', 'password_rules', 'push_params'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'secret_type', 'has_secret', 'privileged', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'AccountTemplateDetail',
                params: { id: row.id }
              })
            }
          },
          privileged: {
            width: '120px',
            formatterArgs: {
              showText: false,
              showFalse: false
            }
          },
          has_secret: {
            formatterArgs: {
              showFalse: false,
              showText: false
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              hasDelete: true,
              hasClone: this.hasClone,
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  can: this.$hasPerm('accounts.view_accounttemplatesecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.secretUrl = `/api/v1/accounts/account-template-secrets/${row.id}/`
                    vm.account = row
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                }
              ],
              onUpdate: ({ row }) => {
                this.$route.params.id = row.id

                this.currentTemplate = 'AccountTemplateUpdate'
                this.drawerTitle = this.$t('UpdateAccountTemplate')
                this.showTableUpdateDrawer = true
              }
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: this.$hasPerm('accounts.view_accounttemplatesecret'),
        hasMoreActions: false,
        hasLabelSearch: true,
        exportOptions: {
          url: '/api/v1/accounts/account-template-secrets/',
          mfaVerifyRequired: true,
          tips: this.$t('AccountExportTips')
        },
        createRoute: () => {
          return {
            name: 'AccountTemplateCreate',
            isPam: true
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page ::v-deep .page-heading {
  display: none;
}

::v-deep .ibox {
  height: 100%;

  .el-card__body {
    height: 100%;
    padding-bottom: unset;
  }
}
</style>
