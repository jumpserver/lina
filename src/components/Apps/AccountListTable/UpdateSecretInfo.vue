<template>
  <Dialog
    v-model:visible="iVisible"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('UpdateAssetUserToken')"
    width="800px"
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
import { encryptPassword } from '@/utils/secure'
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'
import vModelMixin from '@/utils/vue/vModelMixin'

export default {
  name: 'UpdateSecretInfo',
  mixins: [vModelMixin('visible')],
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
  emits: ['update:visible', 'update-auth-done'],
  data() {
    const accountMeta = accountFieldsMeta(this)
    return {
      fields: [
        'name',
        'secret_type',
        'password',
        'ssh_key',
        'token',
        'access_key',
        'passphrase',
        'api_key'
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
  methods: {
    handleConfirm(form) {
      const secretType = this.account.secret_type.value
      const data = {
        secret: encryptPassword(form[secretType])
      }
      this.$axios
        .patch(`/api/v1/accounts/accounts/${this.account.id}/`, data, {
          disableFlashErrorMsg: true
        })
        .then(res => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.$emit('update:visible', false)
        })
        .catch(err => {
          const errMsg = Object.values(err.response.data).join(', ')
          this.$message.error(this.$tc('UpdateErrorMsg') + ' ' + errMsg)
          this.$emit('update:visible', false)
        })
    },
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
