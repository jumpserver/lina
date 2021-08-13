<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import FlowRuleField from './FlowRuleField'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      fields: [
        [this.$t('common.Basic'), ['title', 'type']],
        [this.$t('common.Approval'), ['approval_level', 'rules']]
      ],
      fieldsMeta: {
        rules: {
          label: '审批流程',
          component: FlowRuleField,
          el: {
            level: 1
          },
          hidden: (form) => {
            this.fieldsMeta.rules.el.level = form['approval_level']
            console.log('>>>>>>>>>>', form['approval_level'])
          }
        }
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/tickets/flows/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${this.$route.query.type}`
      },
      onSubmit(form) {
        console.log('Form: ', form)
      }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  },
  mounted() {
    if (this.$store.state.users.profile.user_all_orgs.length > 0) {
      this.initial.org_id = this.$store.state.users.profile.user_all_orgs[0].id
    }
    this.loading = false
  }
}
</script>

<style lang="less" scoped>

</style>
