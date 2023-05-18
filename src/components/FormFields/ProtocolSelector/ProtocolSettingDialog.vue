<template>
  <Dialog
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.PlatformProtocolConfig') + '：' + item.name"
    class="setting-dialog"
    v-bind="$attrs"
    width="70%"
    v-on="$listeners"
  >
    <el-alert v-if="disabled && platformDetail" type="success">
      {{ $t('assets.InheritPlatformConfig') }}
      <el-link :href="platformDetail" class="link-more" target="_blank">
        {{ $t('common.View') }}
      </el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <AutoDataForm
      :disabled="disabled"
      :form="form"
      class="data-form"
      v-bind="config"
      @submit="onSubmit"
    />
  </Dialog>
</template>

<script>
import { AutoDataForm, Dialog } from '@/components'

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
    const vm = this
    const platform = this.$route.query.platform
    return {
      baseAttrs: ['primary', 'required', 'default', 'public'], // 基础属性， 放到 setting 中处理了，处理完成后，还得返回回去
      defaultSetting: {
        sftp_enabled: true,
        sftp_home: '/tmp',
        username_selector: '#username',
        password_selector: '#password',
        submit_selector: '.btn-submit',
        security: 'any',
        console: false
      },
      loading: true,
      form: {},
      platformDetail: platform ? '#/console/assets/platforms/' + platform : '',
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        url: '',
        fields: [
          [this.$t('common.Basic'), [
            {
              id: 'primary',
              label: this.$t('assets.Primary'),
              type: 'switch',
              helpText: this.$t('assets.PrimaryProtocol'),
              on: {
                change: ([val], updateForm) => {
                  const relatedFields = vm.config['fields'][0][1]
                    .filter(item => this.baseAttrs.includes(item.id))
                    .filter(item => item.id !== 'primary')
                  if (val) {
                    const relatedValue = relatedFields.reduce((acc, cur) => {
                      acc[cur.id] = true
                      return acc
                    }, {})
                    updateForm(relatedValue)
                  }
                }
              }
            },
            {
              id: 'required',
              label: this.$t('assets.Required'),
              type: 'switch',
              helpText: this.$t('assets.RequiredProtocol'),
              disabled: false
            },
            {
              id: 'default',
              label: this.$t('assets.Default'),
              type: 'switch',
              helpText: this.$t('assets.DefaultProtocol'),
              disabled: false
            },
            {
              id: 'public',
              label: this.$t('assets.Public'),
              type: 'switch',
              helpText: this.$t('assets.PublicProtocol'),
              disabled: false
            }
          ]],
          [this.$t('assets.LoginConfig'), [
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
              id: 'use_ssl',
              label: this.$t('assets.UseSSL'),
              type: 'switch',
              hidden: () => this.item.name !== 'winrm'
            },
            {
              id: 'sftp_enabled',
              label: this.$t('common.Enable') + ' SFTP',
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
              label: this.$t('assets.UserNameSelector'),
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            },
            {
              id: 'password_selector',
              label: this.$t('assets.PasswordSelector'),
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            },
            {
              id: 'submit_selector',
              label: this.$t('assets.SubmitSelector'),
              type: 'input',
              hidden: (form) => this.item.name !== 'http'
            },
            {
              id: 'auth_username',
              label: this.$t('assets.AuthUsername'),
              type: 'switch',
              hidden: (form) => this.item.name !== 'redis'
            }
          ]]
        ]
      }
    }
  },
  created() {
    this.form = this.item.setting
    if (!this.form || !this.item) {
      return
    }
    for (const i of this.baseAttrs) {
      this.form[i] = !!this.item[i]
    }
  },
  methods: {
    onSubmit(form) {
      for (const i of this.baseAttrs) {
        if (form.hasOwnProperty(i)) {
          this.item[i] = form[i]
        }
      }
      this.item.setting = form
      this.$emit('update:visible', false)
      this.$emit('confirm', this.item)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-form > > > .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

.setting-dialog > > > .el-dialog__body {
  padding-top: 10px;
}

.link-more {
  font-size: 10px;
  margin-left: 10px;
  border-bottom: solid 1px;
  color: inherit;
}
</style>
