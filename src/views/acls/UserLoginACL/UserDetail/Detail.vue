<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import { approvalActionLabel } from '@/views/acls/approval'
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
            change: function (val) {
              vm.$axios
                .patch(`/api/v1/acls/login-acls/${vm.object.id}/`, { is_active: val })
                .then((res) => {
                  vm.$message.success(vm.$tc('UpdateSuccessMsg'))
                })
                .catch((err) => {
                  vm.$message.error(vm.$tc('UpdateErrorMsg' + ' ' + err))
                })
            }
          }
        }
      ],
      dataVal: [],
      url: `/api/v1/acls/login-acls/${vm.object.id}/`,
      detailFields: [
        'name',
        'user_display',
        {
          key: vm.$t('IpGroup'),
          value: vm.object.rules.ip_group.join(', ')
        },
        'dataVal',
        { key: vm.$t('Action'), value: approvalActionLabel(vm.object, vm.$t) },
        'priority',
        'date_created',
        'created_by',
        {
          key: vm.$t(
            vm.object.workflow
              ? 'WFWorkflows'
              : vm.object.action?.value === 'review'
                ? 'Reviewer'
                : 'Recipients'
          ),
          value: vm.object.workflow
            ? vm.object.workflow_name || '-'
            : vm.object.reviewers.map((item) => item.name).join(', ')
        },
        'comment'
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
