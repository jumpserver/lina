<template>
  <div>
    <el-alert type="success" v-html="helpText" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox/index.vue'
import { openTaskPage } from '@/utils/jms'
import store from '@/store'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=ris',
      hasReset: false,
      helpText: this.$t('setting.RisHelpText'),
      moreButtons: [
        {
          title: this.$t('setting.sync'),
          loading: false,
          disabled: !store.getters.publicSettings['RIS_ENABLED'],
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/ris/sync/',
              value
            ).then(res => {
              openTaskPage(res['task'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['RIS_ACCESS_KEY_SECRET'],
      fields: [
        [
          this.$t('setting.account'),
          [
            'RIS_ENABLED',
            'RIS_AUTH_URL',
            'RIS_APP_ID',
            'RIS_ACCESS_KEY_ID',
            'RIS_ACCESS_KEY_SECRET'
          ]
        ]
      ],
      fieldsMeta: {
        RIS_ENABLED: {
          disabled: true,
          label: this.$t('setting.EnableRis')
        },
        RIS_AUTH_URL: {
          hidden: (formValue) => {
            return !formValue.RIS_ENABLED
          }
        },
        RIS_APP_ID: {
          hidden: (formValue) => {
            return !formValue.RIS_ENABLED
          }
        },
        RIS_ACCESS_KEY_ID: {
          hidden: (formValue) => {
            return !formValue.RIS_ENABLED
          }
        },
        RIS_ACCESS_KEY_SECRET: {
          hidden: (formValue) => {
            return !formValue.RIS_ENABLED
          }
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  }
}
</script>

<style scoped>

</style>
