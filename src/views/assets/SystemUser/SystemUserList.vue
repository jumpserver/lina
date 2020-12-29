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
        columns: ['name', 'username', 'protocol', 'login_mode', 'assets_amount', 'comment', 'actions'],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          protocol: {
            width: '100px'
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
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'ssh' }}) }
          },
          {
            title: 'Telnet',
            name: 'Telnet',
            type: 'primary',
            has: true,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'telnet' }}) }
          },
          {
            title: 'RDP',
            name: 'RDP',
            type: 'primary',
            has: true,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'rdp' }}) }
          },
          {
            title: 'VNC',
            name: 'VNC',
            type: 'primary',
            has: true,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'vnc' }}) }
          },
          {
            name: 'MySQL',
            title: 'MySQL',
            divided: true,
            type: 'primary',
            has: true,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'mysql' }}) }
          },
          {
            name: 'PostgreSQL',
            title: 'PostgreSQL',
            type: 'primary',
            has: this.isValidateLicense,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'postgresql' }}) }
          },
          {
            name: 'MariaDB',
            title: 'MariaDB',
            type: 'primary',
            has: this.isValidateLicense,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'mariadb' }}) }
          },
          {
            name: 'Oracle',
            title: 'Oracle',
            type: 'primary',
            has: this.isValidateLicense,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'oracle' }}) }
          },
          {
            name: 'K8S',
            divided: true,
            title: 'K8S',
            type: 'primary',
            has: this.isValidateLicense,
            callback: function() { vm.$router.push({ name: 'SystemUserCreate', query: { protocol: 'k8s' }}) }
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
