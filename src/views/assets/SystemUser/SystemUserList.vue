<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/system-users/',
        columns: ['name', 'username', 'username_same_with_user', 'protocol', 'login_mode', 'assets_amount', 'priority', 'date_created', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'protocol', 'login_mode', 'assets_amount', 'comment', 'actions']
        },
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          protocol: {
            width: '100px'
          },
          username_same_with_user: {
            width: '150px'
          },
          login_mode: {
            width: '120px'
          },
          assets_amount: {
            width: '80px'
          },
          actions: {
            formatterArgs: {
              hasClone: true,
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'SystemUserUpdate', params: { id: row.id }, query: { protocol: row.protocol }})
              },
              onClone: ({ row }) => {
                vm.$router.push({ name: 'SystemUserCreate', query: { protocol: row.protocol, clone_from: row.id }})
              }
            }
          }
        }

      },
      headerActions: {
        hasMoreActions: false,
        hasCreate: false,
        createRoute: 'SystemUserCreate',
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'SystemUserCreate', query: { protocol: option.title.toLowerCase() }})
          },
          dropdown: [
            {
              title: 'SSH',
              name: 'SSH',
              type: 'primary',
              group: this.$t('assets.HostProtocol'),
              has: true
            },
            {
              title: 'Telnet',
              name: 'Telnet',
              type: 'primary',
              has: true
            },
            {
              title: 'RDP',
              name: 'RDP',
              type: 'primary',
              has: true
            },
            {
              title: 'VNC',
              name: 'VNC',
              type: 'primary',
              has: true
            },
            {
              name: 'MySQL',
              title: 'MySQL',
              type: 'primary',
              has: true,
              group: this.$t('assets.DatabaseProtocol')
            },
            {
              name: 'PostgreSQL',
              title: 'PostgreSQL',
              type: 'primary',
              has: this.isValidateLicense
            },
            {
              name: 'MariaDB',
              title: 'MariaDB',
              type: 'primary',
              has: this.isValidateLicense
            },
            {
              name: 'Oracle',
              title: 'Oracle',
              type: 'primary',
              has: this.isValidateLicense
            },
            {
              name: 'K8S',
              title: 'K8S',
              type: 'primary',
              has: this.isValidateLicense,
              group: this.$t('assets.OtherProtocol')
            }
          ]
        }
      },
      helpMessage: this.$t('assets.SystemUserListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentOrg'])
  },
  methods: {
    isValidateLicense() {
      if (this.publicSettings.XPACK_ENABLED) {
        return this.publicSettings.XPACK_LICENSE_IS_VALID
      }
      return false
    }
  }
}
</script>

<style>

</style>
