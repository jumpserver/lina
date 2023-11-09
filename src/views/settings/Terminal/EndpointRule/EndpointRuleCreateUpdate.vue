<template>
  <GenericCreateUpdateDrawer v-bind="$data" />
</template>

<script>
import { GenericCreateUpdateDrawer } from '@/layout/components'

export default {
  name: 'EndpointRuleCreateUpdate',
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      url: '/api/v1/terminal/endpoint-rules/',
      initial: {
        ip_group: ['*']
      },
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointRuleList' }},
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('terminal.Endpoint'), ['ip_group', 'endpoint']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        endpoint: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/terminal/endpoints/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        }
      },
      hasDetailInMsg: false,
      cleanFormValue(value) {
        if (Array.isArray(value.ip_group)) {
          value.ip_group = value.ip_group.filter(Boolean)
        }
        return value
      }
    }
  }
}
</script>

<style scoped>

</style>
