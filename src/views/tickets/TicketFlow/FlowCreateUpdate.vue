<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import FlowRuleField from './FlowRuleField'
export default {
  name: 'FlowCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      fields: [
        [this.$t('common.Basic'), ['type']],
        [this.$t('common.ApprovaLevel'), ['approval_level', 'rules']]
      ],
      fieldsMeta: {
        type: {
          disabled: true
        },
        rules: {
          label: this.$t('tickets.ApprovalProcess'),
          component: FlowRuleField,
          el: {
            level: 1
          },
          hidden: (form) => {
            this.fieldsMeta.rules.el.level = form['approval_level']
          }
        }
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/tickets/flows/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}`
      },
      cleanFormValue(data) {
        data['rules'] = data['rules'].slice(0, data['approval_level'])
        return data
      },
      onPerformError() {
      },
      updateSuccessNextRoute: { name: 'TicketFlow' },
      createSuccessNextRoute: { name: 'TicketFlow' }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  },
  mounted() {
    if (this.$store.getters.consoleOrgs) {
      this.initial.org_id = this.$store.getters.consoleOrgs[0].id
    }
    this.loading = false
  }
}
</script>

<style lang="less" scoped>

</style>
