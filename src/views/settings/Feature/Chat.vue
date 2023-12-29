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
          title: this.$t('common.Test'),
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
        [
          this.$t('setting.ChatAI'),
          [
            'CHAT_AI_ENABLED',
            'GPT_MODEL',
            'GPT_BASE_URL',
            'GPT_API_KEY',
            'GPT_PROXY'
          ]
        ]
      ],
      fieldsMeta: {
        GPT_BASE_URL: {
          el: {
            autocomplete: 'new-password'
          },
          helpText: this.$t('setting.Example', { example: 'https://api.openai.com/v1' })
        },
        GPT_API_KEY: {
          el: {
            autocomplete: 'new-password'
          }
        },
        GPT_PROXY: {
          helpText: this.$t('setting.Example', { example: 'http://ip:port' })
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
