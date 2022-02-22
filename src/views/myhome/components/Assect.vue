<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import { SystemUserFormatter } from '@/components/TableFormatters'

export default {
  name: 'Assect',
  components: {
    HomeCard
  },
  data() {
    return {
      cardConfig: {
        title: this.$t('route.AssetAclList'),
        icon: 'fa-inbox'
      },
      tableConfig: {
        url: '/api/v1/terminal/my-login-assets/?limit=5',
        columns: [
          'hostname', 'ip', 'system_users', 'platform', 'comment', 'actions'
        ],
        columnsMeta: {
          hostname: {
            label: this.$t('perms.hostName'),
            showOverflowTooltip: true
          },
          ip: {
            sortable: false
          },
          system_users: {
            showOverflowTooltip: true,
            align: 'center',
            label: this.$t('assets.SystemUsers'),
            width: '150px',
            formatter: SystemUserFormatter,
            formatterArgs: {
              getUrl: ({ row }) => {
                return `/api/v1/perms/users/assets/${row.id}/system-users/?cache_policy=1`
              }
            }
          },
          platform: {
            label: this.$t('assets.Platform')
          },
          comment: {
            label: this.$t('sessions.comment'),
            showOverflowTooltip: true
          },
          actions: {
            width: '70px',
            formatterArgs: {
              hasDelete: false,
              loading: false,
              hasClone: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'connect',
                  fa: 'fa-terminal',
                  type: 'primary',
                  can: ({ row }) => row.is_active,
                  callback: ({ row }) => {
                    window.open(`/luna/?login_to=${row.id}`, '_blank')
                  }
                }
              ]
            }
          }
        },
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
