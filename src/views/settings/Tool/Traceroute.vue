<template>
  <Base v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import Base from './Base'

export default {
  name: 'Traceroute',
  components: {
    Base
  },
  data() {
    return {
      taskType: 'traceroute',
      fields: [{
        name: 'dest_ips',
        label: this.$t('DestinationIP'),
        tip: this.$t('IP'),
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
