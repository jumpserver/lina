<template>
  <GenericCreateUpdateDrawer
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdateDrawer } from '@/layout/components'

export default {
  name: 'EndpointCreateUpdate',
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      url: '/api/v1/terminal/endpoints/',
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointList' }},
      fields: [
        [this.$t('common.Basic'), ['name', 'host']],
        [
          this.$t('terminal.BasePort'),
          [
            'http_port', 'https_port', 'ssh_port', 'rdp_port'
          ]
        ],
        [
          this.$t('terminal.DatabasePort'),
          [
            'mysql_port', 'mariadb_port', 'postgresql_port',
            'redis_port', 'oracle_port_range'
          ]
        ],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        host: {
          disabled: this.$route.params.id === '00000000-0000-0000-0000-000000000001'
        },
        oracle_port_range: {
          disabled: true
        }
      },
      hasDetailInMsg: false
    }
  },
  computed: {},
  created() {},
  methods: {}
}
</script>

<style scoped>

</style>
