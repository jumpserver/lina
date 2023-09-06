<template>
  <Base v-bind="$data" />
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
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
          name: 'dest_ips',
          label: this.$t('setting.DestinationIP'),
          tip: this.$t('setting.helpTip.IP'),
          el: {
            placeholder: this.$t('setting.DestinationIP')
          }
        },
        {
          name: 'dest_ports',
          component: TagInput,
          label: this.$t('setting.DestinationPort'),
          el: {
            inputType: 'number'
          }
        }
      ],
      rules: {
        dest_ips: rules.Required
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
