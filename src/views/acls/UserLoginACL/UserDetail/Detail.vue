<template>
  <TwoCol>
    <template>
      <AutoDetailCard
        :fields="detailFields"
        :object="object"
        :url="url"
      />
    </template>
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: vm.$t('Active'),
          type: 'switch',
          attrs: {},
          callbacks: {
            change: function(val) {
              vm.$axios.patch(
                `/api/v1/acls/login-acls/${vm.object.id}/`,
                { is_active: val }
              ).then(res => {
                vm.$message.success(vm.$tc('UpdateSuccessMsg'))
              }).catch(err => {
                vm.$message.error(vm.$tc('UpdateErrorMsg' + ' ' + err))
              })
            }
          }
        }
      ],
      dataVal: [],
      url: `/api/v1/acls/login-acls/${vm.object.id}/`,
      detailFields: [
        'name', 'user_display',
        {
          key: vm.$t('IpGroup'),
          value: vm.object.rules.ip_group.join(', ')
        },
        'dataVal', 'action_display', 'priority', 'date_created', 'created_by',
        {
          key: vm.$t('LoginConfirmUser'),
          value: vm.object.reviewers.map(item => item.name).join(', ')
        },
        'comment'
      ]
    }
  }
}
</script>

<style lang='less' scoped>
</style>
