<template>
  <Base v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import Base from './Base'

export default {
  name: 'Telnet',
  components: {
    Base
  },
  data() {
    return {
      taskType: 'telnet',
      fields: [
        {
          name: 'dest_ip',
          label: this.$t('setting.DestinationIP'),
          el: {
            placeholder: this.$t('setting.DestinationIP')
          }
        },
        {
          name: 'dest_port',
          label: this.$t('setting.DestinationPort'),
          el: {
            type: 'number',
            placeholder: this.$t('setting.DestinationPort')
          }
        }
      ],
      rules: {
        dest_ip: rules.Required,
        dest_port: rules.Required
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
