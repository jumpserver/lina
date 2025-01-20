<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('UpdateAssetUserToken')"
    :visible.sync="iVisible"
    width="800px"
    v-on="$listeners"
  >
    <AutoDataForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :form="init"
      :has-reset="false"
      :has-save-continue="false"
      :url="''"
      method="patch"
      @submit="handleConfirm"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { accountFieldsMeta } from '@/components/Apps/AccountCreateUpdateForm/const'
import { encryptPassword } from '@/utils/crypto'
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'

export default {
  name: 'UpdateSecretInfo',
  components: {
    AutoDataForm,
    Dialog
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const accountMeta = accountFieldsMeta(this)
    return {
      fields: [
        'name', 'secret_type', 'password', 'ssh_key', 'token',
        'access_key', 'passphrase', 'api_key'
      ],
      fieldsMeta: {
        ...accountMeta,
        name: {
          ...accountMeta.name,
          readonly: true
        },
        secret_type: {
          hidden: () => true
        }
      },
      init: {
        ...this.account
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
    handleConfirm(form) {
      const secretType = this.account.secret_type.value
      const data = {
        secret: encryptPassword(form[secretType])
      }
      this.$axios.patch(
        `/api/v1/accounts/accounts/${this.account.id}/`,
        data,
        { disableFlashErrorMsg: true }
      ).then(res => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
        this.iVisible = false
      }).catch(err => {
        const errMsg = Object.values(err.response.data).join(', ')
        this.$message.error(this.$tc('UpdateErrorMsg') + ' ' + errMsg)
        this.iVisible = false
      })
    },
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
