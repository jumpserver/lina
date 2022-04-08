<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    :after-get-form-value="afterGetFormValue"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  name: 'EndpointRuleCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/terminal/endpoint-rules/',
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'EndpointRuleList' }},
      fields: [
        [this.$t('common.Basic'), ['name', 'ip_group', 'endpoint', 'priority']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        endpoint: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/terminal/endpoints/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        }
      },
      hasDetailInMsg: false,
      cleanFormValue(value) {
        if (!Array.isArray(value.ip_group)) {
          value.ip_group = value.ip_group ? value.ip_group.split(',') : []
        }
        return value
      },
      afterGetFormValue(formValue) {
        formValue.ip_group = formValue.ip_group.toString()
        return formValue
      }
    }
  }
}
</script>

<style scoped>

</style>
