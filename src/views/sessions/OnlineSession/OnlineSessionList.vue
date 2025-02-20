<template>
  <GenericListPage
    ref="GenericListPage"
    :header-actions="headerActions"
    :help-tip="helpMsg"
    :table-config="tableConfig"
    :title="this.$t('OnlineUserDevices')"
  />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      helpMsg: this.$t('OnlineSessionHelpMsg'),
      tableConfig: {
        permissions: {
          app: 'audits',
          resource: 'usersession'
        },
        url: '/api/v1/audits/user-sessions/',
        columnsExclude: ['backend', 'user', 'is_current_user_session', 'type'],
        columnsShow: {
          min: ['user_display', 'actions'],
          default: [
            'user_display', 'backend_display', 'city',
            'date_created', 'is_active', 'actions'
          ]
        },
        columns: [
          'user_display', 'backend_display', 'city', 'type',
          'date_created', 'is_active', 'date_expired', 'user_agent', 'actions'
        ],
        columnsMeta: {
          is_active: {
            label: this.$t('Active'),
            formatterArgs: {
              showText: false,
              showFalse: false
            }
          },
          user_display: {
            label: this.$t('User'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('users.view_user'),
              getTitle: ({ row }) => { return row.user.name },
              getDrawerTitle({ row }) { return row.user.name },
              getRoute: ({ row }) => {
                return {
                  name: 'UserDetail',
                  params: {
                    id: row.user.id
                  }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'OfflineSession',
                  title: this.$t('Offline'),
                  can: ({ row }) => {
                    return vm.$hasPerm('audits.offline_usersession') && !row.is_current_user_session
                  },
                  type: 'danger',
                  callback: ({ row }) => {
                    this.$axios.post(
                      '/api/v1/audits/user-sessions/offline/',
                      { ids: [row.id] }
                    ).then(() => {
                      vm.$message.success(this.$tc('OfflineSuccessMsg'))
                      vm.$refs.GenericListPage.$refs.ListTable.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasLeftActions: true,
        hasRightActions: true,
        searchConfig: {
          exclude: ['is_active'],
          options: [
            {
              value: 'is_active',
              label: this.$t('Active'),
              children: [
                { value: true, label: this.$t('Yes') },
                { value: false, label: this.$t('No') }
              ]
            }
          ]
        },
        extraMoreActions: [
          {
            name: 'OfflineSelected',
            title: this.$t('OfflineSelected'),
            type: 'danger',
            icon: 'clean',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('audits.offline_usersession')
            },
            callback: function({ selectedRows }) {
              vm.$axios.post(
                '/api/v1/audits/user-sessions/offline/',
                {
                  ids: selectedRows.map(v => {
                    return v.id
                  })
                }
              ).then(res => {
                vm.$message.success(vm.$tc('OfflineSuccessMsg'))
                vm.$refs.GenericListPage.$refs.ListTable.$refs.ListTable.reloadTable()
              })
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cell a {
  color: var(--color-info);
}
</style>
