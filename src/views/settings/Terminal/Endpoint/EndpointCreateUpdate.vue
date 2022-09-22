<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
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
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointList' }},
      fields: [
        [this.$t('common.Basic'), ['name', 'host']],
        [
          this.$t('applications.port'),
          [
            'http_port', 'https_port', 'ssh_port', 'rdp_port',
            'magnus_listen_port_range'
          ]
        ],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        magnus_listen_port_range: {
          disabled: true
        }
      },
      hasDetailInMsg: false
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
