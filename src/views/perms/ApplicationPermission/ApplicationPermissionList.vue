<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :title="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters'
import { ApplicationTypes } from '../const'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      title: this.$t('route.ApplicationPermission'),
      tableConfig: {
        url: '/api/v1/perms/application-permissions/',
        columns: [
          'name', 'type_display', 'category_display', 'users_amount', 'user_groups_amount',
          'applications_amount', 'system_users_amount', 'date_created', 'date_expired',
          'is_valid', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'category_display', 'users_amount', 'user_groups_amount',
            'applications_amount', 'system_users_amount',
            'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          type_display: {
            width: '135px'
          },
          category_display: {
            width: '135px'
          },
          users_amount: {
            label: this.$t('users.Users'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionUser'
              }
            }
          },
          applications_amount: {
            label: this.$t('assets.Applications'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionRemoteApp'
              }
            }
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionRemoteApp'
              }
            }
          },
          actions: {
            formatterArgs: {
              hasClone: true
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasMoreActions: false,
        hasBulkDelete: false,
        // createRoute: 'RemoteAppCreate',
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        moreCreates: {
          dropdown: ApplicationTypes
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
