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
    <el-alert v-if="disabled" type="success">
      继承自平台配置，如需更改，请更改平台中的配置
      <el-link :href="platformDetail" class="link-more" target="_blank">查看</el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <AutoDataForm
      class="data-form"
      :form="form"
      :disabled="disabled"
      v-bind="config"
      @submit="onSubmit"
    />
  </Dialog>
</template>

<script>
import { Dialog, AutoDataForm } from '@/components'
export default {
  name: 'ProtocolSetting',
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultSetting: {
        sftp_enabled: true,
        sftp_home: '/tmp',
        username_selector: '#username',
        password_selector: '#password',
        submit_selector: '.btn-submit'
      },
      loading: true,
      form: {},
      platformDetail: '#/console/assets/platforms/' + this.$route.query.platform,
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        url: '',
        fields: [
          [this.$t('common.Basic'), [
            {
              id: 'primary',
              label: '主要的',
              type: 'switch',
              helpText: '主要的协议, 只能有一个',
              on: {
                change: ([event], updateForm) => {
                  if (event) {
                    updateForm({ required: true })
                  } else {
                    updateForm({ required: false })
                  }
                }
              }
            },
            {
              id: 'required',
              label: '必需的',
              type: 'switch',
              helpText: '必需的协议, 添加资产时必须选择'
            },
            {
              id: 'default',
              label: '默认的',
              type: 'switch',
              helpText: '默认的协议, 添加资产时默认会选择'
            }
          ]],
          ['登录配置', [
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
              id: 'sftp_enabled',
              label: '启用 SFTP',
              type: 'switch',
              hidden: () => this.item.name !== 'ssh'
            },
            {
              id: 'sftp_home',
              label: 'SFTP home',
              type: 'input',
              helpText: this.$t('assets.SFTPHelpMessage'),
              hidden: (form) => this.item.name !== 'ssh' || !form['sftp_enabled']
            },
            {
              id: 'username_selector',
              label: '用户名输入框选择器',
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            },
            {
              id: 'password_selector',
              label: '密码输入框选择器',
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            },
            {
              id: 'submit_selector',
              label: '提交按钮选择器',
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            }
          ]]
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
      this.form = this.item.setting || this.defaultSetting
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
