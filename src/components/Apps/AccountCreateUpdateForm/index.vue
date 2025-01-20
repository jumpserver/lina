<template>
  <AutoDataForm
    v-if="!loading"
    ref="AutoDataForm"
    :class="addTemplate? '': 'account-add'"
    :submit-btn-text="submitBtnText"
    v-bind="$data"
    @submit="confirm"
  />
</template>

<script>
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'
import { encryptPassword } from '@/utils/crypto'
import { accountFieldsMeta } from '@/components/Apps/AccountCreateUpdateForm/const'

export default {
  name: 'AccountCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    asset: {
      type: Object,
      default: null
    },
    platform: {
      type: Object,
      default: null
    },
    account: {
      type: Object,
      default: () => ({})
    },
    // 默认组件密码加密
    encryptPassword: {
      type: Boolean,
      default: true
    },
    addTemplate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      isDisabled: false,
      usernameChanged: false,
      submitBtnText: this.$t('Confirm'),
      iPlatform: {
        automation: {},
        su_enabled: false,
        protocols: [
          {
            name: 'ssh',
            secret_types: ['password', 'ssh_key', 'token', 'access_key', 'api_key']
          }
        ]
      },
      url: '/api/v1/accounts/accounts/',
      form: Object.assign({ 'on_invalid': 'error' }, this.account || {}),
      encryptedFields: ['secret'],
      fields: [
        [this.$t('Basic'), ['name', 'username', 'privileged', 'su_from', 'su_from_username', 'template']],
        [this.$t('Assets'), ['assets']],
        [this.$t('Secret'), [
          'secret_type', 'password', 'ssh_key', 'token',
          'access_key', 'passphrase', 'api_key',
          'secret_reset'
        ]],
        [this.$t('Other'), ['push_now', 'params', 'on_invalid', 'is_active', 'comment']]
      ],
      fieldsMeta: accountFieldsMeta(this),
      hasSaveContinue: false
    }
  },
  watch: {
    '$route.query': {
      handler(nv, ov) {
        if (nv && (nv.flag === 'move' || nv.flag === 'copy')) {
          this.isDisabled = true
        }
      },
      immediate: true
    }
  },
  async mounted() {
    try {
      await this.getPlatform()
      this.setSecretTypeOptions()
      this.getDefaultAssets()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async getDefaultAssets() {
      const assetId = this.$route.query.asset_id
      if (assetId && !this.form.name) {
        this.form.assets = [assetId]
      }
    },
    async getPlatform() {
      if (this.platform) {
        this.iPlatform = this.platform
      }
      if (!this.asset || !this.asset.platform) {
        return
      }
      const platformId = this.asset.platform.id
      this.iPlatform = await this.$axios.get(`/api/v1/assets/platforms/${platformId}/`)
    },
    setSecretTypeOptions() {
      const choices = [
        {
          label: this.$t('Password'),
          value: 'password'
        },
        {
          label: this.$t('SSHKey'),
          value: 'ssh_key'
        },
        {
          label: this.$t('Token'),
          value: 'token'
        },
        {
          label: this.$t('AccessKey'),
          value: 'access_key'
        },
        {
          label: this.$t('ApiKey'),
          value: 'api_key'
        }
      ]
      const secretTypes = []
      this.iPlatform.protocols?.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form?.secret_type) {
        this.form.secret_type = secretTypes[0]
      }
      this.fieldsMeta.secret_type.options = choices.filter(item => {
        return secretTypes.indexOf(item.value) > -1
      })
    },
    confirm(form) {
      const secretType = form.secret_type || 'password'
      form.secret = form[secretType]
      form.secret = this.encryptPassword ? encryptPassword(form.secret) : form.secret

      // 如果不删除会明文显示
      delete form[secretType]

      if (!form.secret) {
        delete form['secret']
      }
      if (this.account?.name) {
        this.$emit('edit', form)
      } else {
        this.$emit('add', form)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.account-add {
  ::v-deep .el-form-item {
    //margin-bottom: 5px;

    .help-block {
      //margin-bottom: 5px;
    }
  }

  ::v-deep .form-group-header {
    .hr-line-dashed {
      //margin: 5px 0;
    }

    h3 {
      margin-bottom: 10px;
    }
  }
}
</style>
