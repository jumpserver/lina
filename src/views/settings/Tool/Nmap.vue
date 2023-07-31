<template>
  <Base v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import Base from './Base'

export default {
  name: 'Nmap',
  components: {
    Base
  },
  data() {
    return {
      taskType: 'nmap',
      fields: [
        {
          name: 'dest_ip', label: this.$t('setting.destinationIP'),
          placeholder: this.$t('setting.destinationIP')
        },
        {
          name: 'dest_port', label: this.$t('setting.testPort'), type: 'multiInput'
        }
      ],
      rules: {
        dest_ip: rules.Required
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
