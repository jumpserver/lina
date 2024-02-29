<template>
  <GenericUpdateFormDialog
    v-if="visible"
    :form-setting="formSetting"
    :selected-rows="selectedRows"
    :visible="visible"
    v-on="$listeners"
  />
</template>

<script>
import { GenericUpdateFormDialog } from '@/layout/components'
import { accountFieldsMeta } from '@/components/Apps/AccountCreateUpdateForm/const'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'AccountBulkUpdateDialog',
  components: {
    GenericUpdateFormDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      formSetting: {
        url: '/api/v1/accounts/accounts/',
        hasSaveContinue: false,
        fields: [],
        fieldsMeta: accountFieldsMeta(this),
        cleanOtherFormValue: (formValue) => {
          for (const value of formValue) {
            Object.keys(value).forEach((item, index, arr) => {
              if (['ssh_key', 'token', 'access_key', 'api_key', 'password'].includes(item)) {
                value['secret'] = encryptPassword(value[item])
                delete value[item]
              }
            })
          }
          return formValue
        }
      }
    }
  },
  created() {
    this.filterFieldsMeta()
  },
  methods: {
    filterFieldsMeta() {
      let fields = ['privileged']
      const fieldsMeta = {}
      const secretFields = ['password', 'ssh_key', 'passphrase', 'token', 'access_key', 'api_key']
      const secret_type = this.selectedRows[0].secret_type?.value || 'password'
      for (const field of secretFields) {
        if (secret_type === 'ssh_key' && field === 'passphrase') {
          fields.push('passphrase')
          this.formSetting.fieldsMeta['passphrase'].hidden = () => false
          continue
        }
        if (secret_type === field) {
          fields.push(field)
          this.formSetting.fieldsMeta[field].hidden = () => false
          continue
        }
        delete this.formSetting.fieldsMeta[field]
      }
      fields = fields.concat(['is_active', 'comment'])
      for (const field of fields) {
        fieldsMeta[field] = this.formSetting.fieldsMeta[field]
      }
      this.formSetting.fields = fields
      this.formSetting.fieldsMeta = fieldsMeta
    }
  }
}
</script>

<style scoped>

</style>
