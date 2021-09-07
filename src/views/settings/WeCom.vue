<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Wecom',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=wecom',
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('setting.weComTest'),
          callback: function(value, form) {
            vm.$axios.post(
              '/api/v1/settings/wecom/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              this.$log.error('err occur')
            })
          }
        }
      ],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'AUTH_WECOM', 'WECOM_CORPID', 'WECOM_AGENTID',
            'WECOM_SECRET'
          ]
        ]
      ],
      fieldsMeta: {
      },
      // 不清理的话，编辑secret，在删除提交会报错
      cleanFormValue(data) {
        if (!data['WECOM_SECRET']) {
          delete data['WECOM_SECRET']
        }
        return data
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
