<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" @submitSuccess="submitSuccess" />
    </IBox>
  </div>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox/index.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=chat',
      hasReset: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/chatai/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_HCP_TOKEN'],
      fields: [
        'CHAT_AI_ENABLED',
        'CHAT_AI_TYPE',
        'GPT_MODEL',
        'DEEPSEEK_MODEL',
        'GPT_BASE_URL',
        'GPT_API_KEY',
        'GPT_PROXY'
      ],
      fieldsMeta: {
        GPT_BASE_URL: {
          el: {
            autocomplete: 'new-password'
          }
        },
        GPT_API_KEY: {
          el: {
            autocomplete: 'new-password'
          }
        },
        CHAT_AI_TYPE: {
          helpText: this.$t('ChatAITypeHelpText')
        },
        GPT_MODEL: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'gpt'
          }
        },
        DEEPSEEK_MODEL: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'deep-seek'
          }
        },
        GPT_PROXY: {
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
