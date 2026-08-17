<template>
  <GenericUpdateFormDialog
    v-bind="$attrs"
    v-if="visible"
    :form-setting="formSetting"
    :selected-rows="selectedRows"
    :target-resource-setting="targetResourceSetting"
    :visible="visible"
    @update="$emit('update', $event)"
    @update:visible="$emit('update:visible', $event)"
  />
</template>

<script>
import { GenericUpdateFormDialog } from '@/layout/components'
import { accountFieldsMeta } from '@/components/Apps/AccountCreateUpdateForm/const'
import { encryptPassword } from '@/utils/session-encrypt'

export default {
  name: 'AccountBulkUpdateDialog',
  components: {
    GenericUpdateFormDialog
  },
  emits: ['update', 'update:visible'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const selectedSecretType = this.selectedRows[0]?.secret_type
    const secretType = selectedSecretType?.value || selectedSecretType || 'password'
    return {
      targetResourceSetting: {
        label: this.$t('Account'),
        url: '/api/v1/accounts/accounts/?fields_size=mini',
        resourceName: this.$t('Accounts'),
        queryParams: {
          secret_type: secretType
        }
      },
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
      const selectedSecretType = this.selectedRows[0]?.secret_type
      const secret_type = selectedSecretType?.value || selectedSecretType || 'password'
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

<style scoped></style>
