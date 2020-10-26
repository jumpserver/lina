<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :title="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      title: this.$t('perms.KubernetesAppPermission'),
      tableConfig: {
        url: '/api/v1/perms/k8s-app-permissions/',
        columns: ['name', 'users_amount', 'user_groups_amount', 'k8s_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'KubernetesAppPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          users_amount: {
            label: this.$t('perms.User'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'KubernetesAppPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'KubernetesAppPermissionUser'
              }
            }
          },
          k8s_apps_amount: {
            label: this.$t('perms.KubernetesApp'),
            width: '140px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'KubernetesAppPermissionKubernetesApp'
              }
            }
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'KubernetesAppPermissionKubernetesApp'
              }
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
