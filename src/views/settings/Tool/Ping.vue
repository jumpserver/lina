<template>
  <Base v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import Base from './Base'

export default {
  name: 'Ping',
  components: {
    Base
  },
  data() {
    return {
      taskType: 'ping',
      fields: [{
        name: 'dest_ips',
        label: this.$t('DA'),
        el: {
          placeholder: this.$t('DestinationIP')
        }
      }],
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
