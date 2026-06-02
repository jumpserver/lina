<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="{ ...$data, fields }"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { mapGetters } from 'vuex'

export default {
  name: 'EndpointCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/terminal/endpoints/',
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointList' } },
      fieldsMeta: {
        host: {
          disabled: this.$route.params.id === '00000000-0000-0000-0000-000000000001'
        },
        is_active: {
          disabled: this.$route.params.id === '00000000-0000-0000-0000-000000000001'
        }
      },
      hasDetailInMsg: false
    }
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    }),
    fields() {
      let dbFields = [
        'mysql_port', 'mariadb_port', 'postgresql_port',
        'redis_port', 'sqlserver_port'
      ]
      if (this.publicSettings.VENDOR.toLowerCase() === 'jumpserver') {
        dbFields = dbFields.concat(['oracle_port', 'mongodb_port'])
      }
      return [
        [this.$t('Basic'), ['name', 'host']],
        [
          this.$t('Port'),
          ['http_port', 'https_port', 'ssh_port', 'rdp_port', 'vnc_port']
        ],
        ['', dbFields],
        [this.$t('Other'), ['is_active', 'comment']]
      ]
    }
  },
  created() {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
