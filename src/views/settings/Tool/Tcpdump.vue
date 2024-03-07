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
          label: this.$t('SourceIP'),
          tip: this.$t('IP'),
          el: {
            placeholder: this.$t('SourceIP')
          }
        },
        {
          name: 'src_ports',
          component: TagInput,
          label: this.$t('SourcePort'),
          el: {
            inputType: 'number'
          }
        },
        {
          name: 'dest_ips',
          label: this.$t('DestinationIP'),
          tip: this.$t('IP'),
          el: {
            placeholder: this.$t('DestinationIP')
          }
        },
        {
          name: 'dest_ports',
          component: TagInput,
          label: this.$t('DestinationPort'),
          el: {
            inputType: 'number'
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
