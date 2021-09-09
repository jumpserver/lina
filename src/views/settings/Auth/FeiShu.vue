<template>
  <BaseAuth v-model="value" :title="$t('setting.FeiShu')">
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
      url: '/api/v1/settings/setting/?category=feishu',
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('setting.feiShuTest'),
          callback: function(value, form) {
            vm.$axios.post(
              '/api/v1/settings/feishu/testing/',
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
            'AUTH_FEISHU', 'FEISHU_APP_ID', 'FEISHU_APP_SECRET'
          ]
        ]
      ],
      fieldsMeta: {
      },
      // 不清理的话，编辑secret，在删除提交会报错
      cleanFormValue(data) {
        if (!data['FEISHU_APP_SECRET']) {
          delete data['FEISHU_APP_SECRET']
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
