<template>
  <GenericCreateUpdatePage v-bind="$data" :initial="initial" />
</template>

<script>
import { ResourceSelect } from '@/components/Form/FormFields'
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
        [this.$t('Basic'), ['name', 'cc_users']],
        [this.$t('ApprovalLevel'), ['approval_level', 'rules']]
      ],
      fieldsMeta: {
        rules: {
          label: this.$t('ApprovalProcess'),
          component: FlowRuleField,
          el: {
            level: 1
          },
          hidden: (form) => {
            this.fieldsMeta.rules.el.level = form['approval_level']
          }
        },
        cc_users: {
          type: 'resourceSelect',
          component: ResourceSelect,
          label: this.$t('CcUsers'),
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        }
      },
      getUrl() {
        let url = `/api/v1/tickets/flows/`
        const id = this.$context.get('id')
        if (id) {
          url = `${url}${id}/`
        }
        return `${url}`
      },
      cleanFormValue(data) {
        const approvalLevel = Number(data['approval_level']) || 1
        const rules = Array.isArray(data['rules']) ? data['rules'] : []
        data['rules'] = rules.slice(0, approvalLevel).map((rule, index) => ({
          level: index + 1,
          users: rule.users
        }))
        return data
      },
      updateSuccessNextRoute: { name: 'TicketFlow' },
      createSuccessNextRoute: { name: 'TicketFlow' }
    }
  },
  computed: {
    initial() {
      return this.$context.getScope('overlay')?.query || this.$route.query
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

<style lang="scss" scoped></style>
