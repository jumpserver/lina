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
        name: 'dest_ip', label: this.$t('setting.destinationIP'), placeholder: this.$t('setting.destinationIP')
      }],
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
