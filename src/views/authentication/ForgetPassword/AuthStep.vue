<template>
  <CentralForm
    ref="centralForm"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :config="config"
  />
</template>

<script>
import { CentralForm } from '@/components'
import { CaptchaButton, Radio } from '@/components/FormFields'

export default {
  name: 'ForgetPasswordAuthStep',
  components: {
    CentralForm
  },
  data() {
    return {
      helpTextMap: {},
      fields: ['methods', 'account', 'code'],
      fieldsMeta: {
        methods: {
          component: Radio,
          el: {
            value: 'email',
            ajax: {
              defaultValue: 'email',
              url: `/api/v1/authentication/password/forget/auth/?token=${this.$route.query.token}`,
              transformOption: (item) => {
                this.helpTextMap[item.value] = item.help_text
                return { label: item.name, value: item.value, disabled: !item.is_active }
              }
            }
          },
          on: {
            change: ([val]) => {
              this.config.subTitle = this.helpTextMap[val]
            }
          }
        },
        account: {
          label: this.$t('users.Account')
        },
        code: {
          component: CaptchaButton,
          el: {
            url: '',
            btnCallback: () => {
              let can = true
              this.$refs['centralForm'].iForm.validateField(
                'account', err => { can = !err }
              )
              return can
            }
          }
        }
      },
      config: {
        url: `/api/v1/authentication/password/forget/auth/?token=${this.$route.query.token}`,
        subTitle: '',
        btnCallback: (resp) => {
          // 跳转路由
          console.log('resp: ', resp)
        }
      }
    }
  },
  created() {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
