<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/FormFields/Select2'
import Protocols from './components/Protocols'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id']],
        [this.$t('common.ApprovaLevel'), ['templated_approves']]
      ],
      fieldsMeta: {
        type: {
          type: 'select',
          options: [{
            label: 'MySQL',
            value: 'mysql'
          }],
          disabled: true
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.user_all_orgs.map((item) => {
              return { label: item.name, value: item.id }
            })
          }
        },
        templated_approves: {
          component: Protocols
        }
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/tickets/templates/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${this.$route.query.type}`
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
