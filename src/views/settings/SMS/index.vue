<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import IBox from '@/components/IBox'
import SMS from './SMS'

export default {
  name: 'Auth',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=sms',
      fields: [
        [
          this.$t('setting.SMS'), [
            'SMS_ENABLED',
            'SMS_BACKEND',
            'SET_UP'
          ]
        ]
      ],
      fieldsMeta: {
        SET_UP: {
          component: SMS,
          el: {
            smsType: 'alibaba'
          },
          hidden: (form) => {
            this.fieldsMeta.SET_UP.el.smsType = form['SMS_BACKEND']
          }
        }
      },
      submitMethod() {
        return 'patch'
      },
      cleanFormValue(data) {
        // 这个页面不去提交auth这些
        const removeFields = [
          'SET_UP'
        ]
        for (const i of removeFields) {
          delete data[i]
        }
        return data
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
