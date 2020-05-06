<template>
  <GenericCreateUpdateForm
    :fields="selectFields"
    :url="url"
    :initial="object"
    :update-success-next-route="successUrl"
    :clean-form-value="cleanFormValue"
    :object.sync="object"
    :fields-meta="fieldsMeta"
    :get-method="getMethod"
  />
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Email',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectFields: ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_HOST_USER', 'EMAIL_HOST_PASSWORD',
        'EMAIL_FROM', 'EMAIL_RECIPIENT', 'EMAIL_USE_SSL', 'EMAIL_USE_TLS'],
      successUrl: { name: 'Settings', params: { activeMenu: 'Email' }},
      fieldsMeta: {
        EMAIL_HOST: {
          label: this.$t('setting.emailHost'),
          rules: [
            { required: true }
          ]
        },
        EMAIL_PORT: {
          label: this.$t('setting.emailPort'),
          rules: [
            { required: true }
          ]
        },
        EMAIL_HOST_USER: {
          label: this.$t('setting.emailHostUser'),
          rules: [
            { required: true }
          ]
        },
        EMAIL_HOST_PASSWORD: {
          label: this.$t('setting.emailHostPassword'),
          helpText: this.$t('setting.helpText.emailHostPassword')
        },
        EMAIL_FROM: {
          label: this.$t('setting.emailEmailFrom'),
          helpText: this.$t('setting.helpText.emailEmailFrom')
        },
        EMAIL_RECIPIENT: {
          label: this.$t('setting.emailRecipient'),
          helpText: this.$t('setting.helpText.emailRecipient')
        },
        EMAIL_USE_SSL: {
          label: this.$t('setting.emailUserSSL'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.emailUserSSL')
        },
        EMAIL_USE_TLS: {
          label: this.$t('setting.emailUserTLS'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.emailUserTLS')
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        email: data
      }
    },
    getMethod() {
      return 'put'
    }
  }

}
</script>

<style scoped>

</style>
