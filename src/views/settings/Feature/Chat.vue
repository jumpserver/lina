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
        'DEEPSEEK_BASE_URL',
        'DEEPSEEK_API_KEY',
        'DEEPSEEK_PROXY',
        'DEEPSEEK_MODEL',
        'GPT_BASE_URL',
        'GPT_API_KEY',
        'GPT_PROXY',
        'GPT_MODEL'
      ],
      fieldsMeta: {
        GPT_BASE_URL: {
          el: {
            autocomplete: 'new-password'
          },
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'gpt'
          }
        },
        GPT_API_KEY: {
          el: {
            autocomplete: 'new-password'
          },
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'gpt'
          }
        },
        GPT_PROXY: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'gpt'
          }
        },
        GPT_MODEL: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'gpt'
          }
        },
        DEEPSEEK_BASE_URL: {
          el: {
            autocomplete: 'new-password'
          },
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'deep-seek'
          }
        },
        DEEPSEEK_API_KEY: {
          el: {
            autocomplete: 'new-password'
          },
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'deep-seek'
          }
        },
        DEEPSEEK_PROXY: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'deep-seek'
          }
        },
        DEEPSEEK_MODEL: {
          hidden: (formValue) => {
            return formValue.CHAT_AI_TYPE !== 'deep-seek'
          }
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
