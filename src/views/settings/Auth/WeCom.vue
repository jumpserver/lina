<template>
  <BaseAuth v-model="value" :title="$t('setting.WeCom')">
    <GenericCreateUpdateForm v-bind="$data" />
  </BaseAuth>
</template>

<script>
import BaseAuth from './Base'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Wecom',
  components: {
    BaseAuth,
    GenericCreateUpdateForm
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
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
