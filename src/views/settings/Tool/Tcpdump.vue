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
          label: this.$t('setting.Interface')
        },
        [
          {
            name: 'src_ips',
            label: this.$t('setting.SourceIP'),
            tip: this.$t('setting.helpTip.IP'),
            el: {
              placeholder: this.$t('setting.SourceIP')
            }
          },
          {
            name: 'src_ports',
            component: TagInput,
            label: this.$t('setting.SourcePort'),
            el: {
              inputType: 'number'
            }
          }
        ],
        [
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
        ]
      ]
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
