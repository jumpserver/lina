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
          'date_created', 'is_active', 'date_expired', 'actions'
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
            formatter: function(row) {
              const to = {
                name: 'UserDetail',
                params: { id: row.user.id }
              }
              if (vm.$hasPerm('users.view_user')) {
                return <router-link to={to}>{row.user.name}</router-link>
              } else {
                return <span>{row.user.name}</span>
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
            title: this.$t('BatchOffline'),
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
