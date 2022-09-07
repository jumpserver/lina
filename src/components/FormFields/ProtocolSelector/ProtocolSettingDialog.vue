<template>
  <Dialog
    :title="'平台协议配置：' + item.name"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    class="setting-dialog"
    width="70%"
    v-bind="$attrs"
    @open="onOpen"
    v-on="$listeners"
  >
    <el-alert type="success">
      继承自平台配置，如需更改，请更改平台中的配置
      <el-link :href="platformDetail" class="link-more" target="_blank">查看</el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <DataForm
      class="data-form"
      :form="form"
      :disabled="iDisabled"
      v-bind="config"
      @submit="onSubmit"
    />
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
    },
    disabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      form: this.item.setting || {},
      iDisabled: this.disabled,
      platformDetail: '#/console/assets/platforms/' + this.$route.query['platform'],
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        fields: [
          {
            id: 'required',
            label: '必须配置',
            helpText: '资产上必须开启该协议',
            type: 'switch'
          },
          {
            id: 'console',
            label: 'Console',
            type: 'switch',
            hidden: () => this.item.name !== 'rdp'
          },
          {
            id: 'security',
            label: 'Security',
            hidden: () => this.item.name !== 'rdp',
            type: 'radio-group',
            options: [
              { label: 'Any', value: 'any' },
              { label: 'RDP', value: 'rdp' },
              { label: 'NLA', value: 'nla' },
              { label: 'TLS', value: 'tls' }
            ]
          },
          {
            id: 'sftp_home',
            label: 'SFTP home',
            type: 'input',
            helpText: this.$t('assets.SFTPHelpMessage'),
            hidden: () => this.item.name !== 'sftp'
          }
        ]
      }
    }
  },
  methods: {
    onSubmit(form) {
      this.item.setting = form
      this.$emit('update:visible', false)
    },
    onOpen() {
      this.form = this.item.setting
    }
  }
}
</script>

<style lang="scss" scoped>
.data-form >>> .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

.setting-dialog >>> .el-dialog__body {
  padding-top: 10px;
}
.link-more {
  font-size: 10px;
  margin-left: 10px;
  border-bottom: solid 1px;
  color: inherit;
}
</style>
