<template>
  <Dialog
    :title="$tc('Protocol setting: ') + item.name"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <DataForm class="data-form" v-bind="config" @submit="onSubmit" />
  </Dialog>
</template>

<script>
import { Dialog, DataForm } from '@/components'
export default {
  name: 'ProtocolSetting',
  components: {
    Dialog,
    DataForm
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      config: {
        form: {
          console: true,
          security: 'any'
        },
        hasSaveContinue: false,
        fields: [
          {
            id: 'console',
            label: 'Console',
            type: 'switch'
          },
          {
            id: 'security',
            label: 'Security',
            type: 'radio-group',
            options: [
              {
                label: 'RDP',
                value: 'rdp'
              },
              {
                label: 'NLA',
                value: 'nla'
              },
              {
                label: 'TLS',
                value: 'tls'
              },
              {
                label: 'Any',
                value: 'any'
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    onSubmit(form) {
      this.item.setting = form
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-form >>> .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

</style>
