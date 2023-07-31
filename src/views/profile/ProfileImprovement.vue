<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Required } from '@/components/Form/DataForm/rules'
import { PhoneInput } from '@/components/Form/FormFields'

export default {
  name: 'ProfileUpdate',
  components: {
    GenericCreateUpdatePage
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
        phone: {
          component: PhoneInput
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
          rules: [Required],
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
      },
      performSubmit(validValues) {
        if (!validValues.terms) {
          this.$message.error(this.$tc('common.PleaseAgreeToTheTerms'))
          return Promise.reject()
        }
        return this.$axios['patch'](this.url, validValues)
      },
      onPerformSuccess() {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
        this.$store.dispatch('users/ifFirstLogin', false)
        setTimeout(() => this.$router.push({ name: 'ProfileInfo' }), 100)
      },
      submitMethod() {
        return 'put'
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
