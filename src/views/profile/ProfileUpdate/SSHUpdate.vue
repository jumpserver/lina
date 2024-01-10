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
      :url="url"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

export default {
  name: 'SSHUpdate',
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
        [this.$t('OldSSHKey'), ['public_key_comment', 'public_key_hash_md5']],
        [this.$t('UpdateSSHKey'), ['public_key']]
      ],
      fieldsMeta: {
        public_key_comment: {
          label: this.$t('Name'),
          disabled: true
        },
        public_key_hash_md5: {
          label: this.$t('FingerPrint'),
          disabled: true
        },
        public_key: {
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
