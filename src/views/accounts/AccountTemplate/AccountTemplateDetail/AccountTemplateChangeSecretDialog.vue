<template>
  <Dialog
    v-if="iVisible"
    :visible.sync="iVisible"
    :title="$tc('accounts.UpdateSecret')"
    width="50%"
    :show-cancel="false"
    :show-confirm="false"
    :destroy-on-close="true"
  >
    <AutoDataForm
      :form="form"
      v-bind="config"
      @submit="onSubmit"
    />
  </Dialog>
</template>

<script>
import { AutoDataForm, Dialog } from '@/components'
import { templateFieldsMeta } from '../const.js'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'AccountTemplateChangeSecretDialog',
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: this.object,
      secretType: this.object?.secret_type?.value,
      config: {
        hasSaveContinue: false,
        url: '/api/v1/accounts/account-templates/',
        fields: [
          ['', [
            'secret_type', 'secret', 'ssh_key', 'token',
            'access_key', 'passphrase'
          ]]
        ],
        fieldsMeta: {
          ...templateFieldsMeta(this),
          secret_type: {
            disabled: true
          }
        }
      }
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    onSubmit(form) {
      const { object, secretType } = this
      const currentSecretType = secretType === 'password' ? form?.['secret'] : form?.[secretType]
      const params = {
        secret: currentSecretType ? encryptPassword(currentSecretType) : '',
        is_sync_account: true,
        ...(secretType === 'ssh_key' && { passphrase: encryptPassword(form?.['passphrase']) })
      }

      this.$axios.patch(
        `/api/v1/accounts/account-templates/${object.id}/sync-update-secret/`,
        params
      ).then(() => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).finally(() => {
        this.iVisible = false
      })
    }
  }
}
</script>
