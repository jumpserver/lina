<template>
  <Dialog
    :title="$tc('assets.PlatformProtocolConfig') + '：' + item.name"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    class="setting-dialog"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-alert v-if="disabled" type="success">
      {{ $t('assets.InheritPlatformConfig') }}
      <el-link :href="platformDetail" class="link-more" target="_blank">
        {{ $t('common.View') }}
      </el-link>
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
      bases: ['required', 'default'],
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
            // {
            //   id: 'primary',
            //   label: this.$t('assets.Primary'),
            //   type: 'switch',
            //   helpText:  this.$t('assets.PrimaryOnly'),
            //   on: {
            //     change: ([event], updateForm) => {
            //       if (event) {
            //         updateForm({ required: true })
            //       } else {
            //         updateForm({ required: false })
            //       }
            //     }
            //   }
            // },
            {
              id: 'required',
              label: this.$t('assets.Required'),
              type: 'switch',
              helpText: this.$t('assets.RequiredProtocols')
            },
            {
              id: 'default',
              label: this.$t('assets.Default'),
              type: 'switch',
              helpText: this.$t('assets.DefaultProtocol')
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
            }
          ]]
        ]
      }
    }
  },
  created() {
    const itemSetting = this.item.setting || this.defaultSetting
    for (const i of this.bases) {
      if (this.item.hasOwnProperty(i)) {
        itemSetting[i] = this.item[i]
      }
    }
    this.form = itemSetting
  },
  methods: {
    onSubmit(form) {
      for (const i of this.bases) {
        if (form.hasOwnProperty(i)) {
          this.item[i] = form[i]
        }
      }
      this.item.setting = form
      this.$emit('update:visible', false)
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
