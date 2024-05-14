<template>
  <IBox>
    <GenericCreateUpdateForm
      ref="GenericCreateUpdateForm"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :more-buttons="moreButtons"
      :on-perform-success="onPerformSuccess"
      :submit-method="submitMethod"
      :after-get-form-value="afterGetFormValue"
      :url="url"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

export default {
  name: 'SSHKey',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: '/api/v1/users/profile/public-key/',
      fields: [
        ['', ['current_public_key']],
        ['', ['public_key']]
      ],
      fieldsMeta: {
        current_public_key: {
          label: this.$t('OldPublicKey'),
          disabled: true
        },
        public_key: {
          label: this.$t('NewPublicKey'),
          el: {
            type: 'textarea',
            placeholder: 'ssh-rsa AAAA...',
            autosize: { minRows: 3 }
          },
          helpText: this.$t('SSHKeyOfProfileSSHUpdatePage')
        }
      },
      moreButtons: [
        {
          title: this.$t('ResetAndDownloadSSHKey'),
          callback: function() {
            window.open(`/core/auth/profile/pubkey/generate/`, '_blank')
          }
        }
      ]
    }
  },
  methods: {
    afterGetFormValue(value) {
      const publicKey = `${value['public_key_comment'] || '-'} (${value['public_key_hash_md5'] || '-'})`
      value['current_public_key'] = publicKey
      return value
    },
    submitMethod() {
      return 'put'
    },
    onPerformSuccess() {
      this.$refs.GenericCreateUpdateForm.$refs.form.$refs.dataForm.resetForm('form')
      this.$message.success(this.$tc('UpdateSuccessMsg'))
    }
  }
}
</script>

<style scoped>

</style>
