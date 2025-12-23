<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" @submit-success="submitSuccess" />
    </IBox>
  </div>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/Common/IBox/index.vue'
import { mapGetters } from 'vuex'
import ChatProvidersField from './components/ChatProvidersField.vue'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const hasProviders = (formValue) => {
      const providers = formValue?.CHAT_AI_PROVIDERS?.providers || []
      return Array.isArray(providers) && providers.length > 0
    }
    return {
      url: '/api/v1/settings/setting/?category=chat',
      hasReset: false,
      moreButtons: [
      ],
      encryptedFields: ['VAULT_HCP_TOKEN'],
      fields: [
        'CHAT_AI_ENABLED',
        'CHAT_AI_METHOD',
        'CHAT_AI_PROVIDERS',
        'CHAT_AI_EMBED_URL'
      ],
      fieldsMeta: {
        CHAT_AI_TYPE: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_METHOD !== 'api' || hasProviders(formValue)
          }
        },
        CHAT_AI_PROVIDERS: {
          component: ChatProvidersField,
          hidden: (formValue) => formValue.CHAT_AI_METHOD !== 'api'
        },
        CHAT_AI_EMBED_URL: {
          hidden: (formValue) => formValue.CHAT_AI_METHOD !== 'embed'
        }
      },
      afterGetFormValue(formValue) {
        const providers = Array.isArray(formValue.CHAT_AI_PROVIDERS) ? formValue.CHAT_AI_PROVIDERS : []
        return {
          ...formValue,
          CHAT_AI_PROVIDERS: {
            providers: providers
          }
        }
      },
      cleanFormValue(values) {
        const config = values.CHAT_AI_PROVIDERS || {}
        const providers = Array.isArray(config.providers) ? config.providers : []
        return {
          ...values,
          CHAT_AI_PROVIDERS: providers,
          CHAT_AI_TYPE: values.CHAT_AI_TYPE || providers[0]?.type || values.CHAT_AI_TYPE
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ])
  },
  methods: {
    submitSuccess(res) {
      const setting = { ...this.publicSettings, ...res }
      this.$store.dispatch('settings/changeSetting', {
        key: 'publicSettings',
        value: setting || {}
      })
    }
  }
}
</script>

<style scoped>

</style>
