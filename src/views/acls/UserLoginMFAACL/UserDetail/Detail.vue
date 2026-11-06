<template>
  <TwoCol>
    <template>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
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
              vm.$axios
                .patch(`/api/v1/acls/login-mfa-acls/${vm.object.id}/`, { is_active: val })
                .then(res => {
                  vm.$message.success(vm.$tc('UpdateSuccessMsg'))
                })
                .catch(err => {
                  vm.$message.error(vm.$tc('UpdateErrorMsg' + ' ' + err))
                })
            }
          }
        }
      ],
      dataVal: [],
      url: `/api/v1/acls/login-mfa-acls/${vm.object.id}/`,
      detailFields: [
        'name',
        'user_display',
        {
          key: vm.$t('IpGroup'),
          value: vm.object.rules.ip_group.join(', ')
        },
        {
          key: vm.$t('MFAType'),
          value: vm.object.mfa_type
        },
        'dataVal',
        'action_display',
        'priority',
        'date_created',
        'created_by',
        'comment'
      ]
    }
  }
}
</script>

<style lang="less" scoped></style>
