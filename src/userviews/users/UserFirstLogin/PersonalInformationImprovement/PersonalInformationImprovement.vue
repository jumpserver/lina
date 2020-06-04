<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :url="url"
      :update-success-next-route="updateSuccessNextRoute"
      :clean-form-value="cleanFormValue"
      :get-method="getMethod"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index'
import { IBox } from '@/components'

export default {
  name: 'ProfileUpdate',
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
      url: `/api/v1/users/profile/`,
      fields: [
        [this.$t('users.Account'), ['username', 'name', 'email']],
        [this.$t('users.Authentication'), ['mfa_level', 'public_key']],
        [this.$t('common.Other'), ['phone', 'wechat']],
        [this.$t('users.TermsAndConditions'), ['terms']]
      ],
      fieldsMeta: {
        username: {
          disabled: true
        },
        name: {
          disabled: true
        },
        email: {
          disabled: true
        },
        mfa_level: {
          hidden: (formValue) => {
            return formValue.mfa_level === 2
          },
          helpText: this.$t('users.HelpText.MFAOfUserFirstLoginPersonalInformationImprovementPage')
        },
        public_key: {
          label: this.$t('users.SSHKey'),
          el: {
            type: 'textarea',
            placeholder: 'ssh-rsa AAAA...'
          },
          hidden: (formValue) => {
            return formValue.source !== 'local'
          },
          helpText: this.$t('users.HelpText.SSHKeyOfProfileSSHUpdatePage')
        },
        terms: {
          label: this.$t('users.IAgree'),
          type: 'checkbox',
          checked: false,
          rules: [
            { required: true }
          ],
          helpText: this.$t('users.HelpText.MFAOfUserFirstLoginUserGuidePage')
        }
      },
      updateSuccessNextRoute: { name: 'UserGuide' },
      cleanFormValue(value) {
        value = Object.assign({}, value, { is_first_login: false })
        if (value.mfa_level === 2) {
          delete value['mfa_level']
        }
        return value
      }
    }
  },
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
