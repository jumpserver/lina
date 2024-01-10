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
          name: 'dest_ips',
          label: this.$t('DestinationIP'),
          tip: this.$t('IP'),
          el: {
            placeholder: this.$t('DestinationIP')
          }
        },
        {
          name: 'dest_port',
          label: this.$t('DestinationPort'),
          el: {
            type: 'number',
            placeholder: this.$t('DestinationPort')
          }
        }
      ],
      rules: {
        dest_ips: rules.Required,
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
