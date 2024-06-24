<template>
  <Base v-bind="$data" />
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
import Base from './Base'

export default {
  name: 'Tcpdump',
  components: {
    Base
  },
  data() {
    return {
      taskType: 'tcpdump',
      fields: [
        {
          name: 'interfaces',
          component: TagInput,
          label: this.$t('Interface')
        },
        {
          name: 'src_ips',
          label: this.$t('SA'),
          el: {
            placeholder: this.$t('SourceIP')
          }
        },
        {
          name: 'src_ports',
          component: TagInput,
          label: this.$t('SP'),
          el: {
            inputType: 'number',
            placeholder: this.$t('SourcePort')
          }
        },
        {
          name: 'dest_ips',
          label: this.$t('DA'),
          el: {
            placeholder: this.$t('DestinationIP')
          }
        },
        {
          name: 'dest_ports',
          component: TagInput,
          label: this.$t('DP'),
          el: {
            inputType: 'number',
            placeholder: this.$t('DestinationPort')
          }
        }
      ]
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
