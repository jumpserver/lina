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
        moreCreatesTitle: this.$t('common.Create'),
        moreCreatesType: 'primary',
        moreCreates: [
          {
            title: 'SSH',
            name: 'SSH',
            type: 'primary',
            has: true,
            callback: this.createSystemUser('ssh').bind(this)
          },
          {
            title: 'Telnet',
            name: 'Telnet',
            type: 'primary',
            has: true,
            callback: this.createSystemUser('telnet').bind(this)
          },
          {
            title: 'RDP',
            name: 'RDP',
            type: 'primary',
            has: true,
            callback: this.createSystemUser('rdp').bind(this)
          },
          {
            title: 'VNC',
            name: 'VNC',
            type: 'primary',
            has: true,
            callback: this.createSystemUser('vnc').bind(this)
          },
          {
            name: 'MySQL',
            title: 'MySQL',
            divided: true,
            type: 'primary',
            has: true,
            callback: this.createSystemUser('mysql').bind(this)
          },
          {
            name: 'PostgreSQL',
            title: 'PostgreSQL',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createSystemUser('postgresql').bind(this)
          },
          {
            name: 'MariaDB',
            title: 'MariaDB',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createSystemUser('mariadb').bind(this)
          },
          {
            name: 'Oracle',
            title: 'Oracle',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createSystemUser('oracle').bind(this)
          },
          {
            name: 'K8S',
            divided: true,
            title: 'K8S',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createSystemUser('k8s').bind(this)
          }
        ]
      },
      helpMessage: this.$t('assets.SystemUserListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentOrg'])
  },
  methods: {
    createSystemUser(type) {
      return () => { this.$router.push({ name: 'SystemUserCreate', query: { protocol: type }}) }
    },
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
