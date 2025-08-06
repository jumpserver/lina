<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="$data"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'EndpointCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/terminal/endpoints/',
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointList' } },
      fields: [
        [this.$t('Basic'), ['name', 'host']],
        [
          this.$t('Port'),
          [
            'http_port', 'https_port', 'ssh_port', 'rdp_port', 'vnc_port'
          ]
        ],
        [
          '',
          [
            'mysql_port', 'mariadb_port', 'postgresql_port',
            'redis_port', 'sqlserver_port', 'oracle_port',
            'mongodb_port'
          ]
        ],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
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
  computed: {},
  created() {
  },
  methods: {}
}
</script>

<style scoped>

</style>
