<template>
  <div>
    <el-alert v-if="helpMessage" type="success">
      <span v-html="helpMessage" />
    </el-alert>
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      helpMessage: this.$t('assets.SystemUserListHelpMessage'),
      tableConfig: {
        url: '/api/v1/assets/system-users/?type=common',
        columns: [
          'name', 'username', 'username_same_with_user', 'protocol',
          'login_mode', 'assets_amount', 'priority',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
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
              has: this.$store.getters.hasValidLicense
            },
            {
              name: 'MariaDB',
              title: 'MariaDB',
              type: 'primary',
              has: this.$store.getters.hasValidLicense
            },
            {
              name: 'Oracle',
              title: 'Oracle',
              type: 'primary',
              has: this.$store.getters.hasValidLicense
            },
            {
              name: 'K8S',
              title: 'K8S',
              type: 'primary',
              group: this.$t('assets.OtherProtocol')
            }
          ]
        }
      }
    }
  }
}
</script>

<style>

</style>
