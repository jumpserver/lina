<template>
  <GenericCreateUpdatePage v-bind="config" @getObjectDone="getObjectDone" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { TextReadonly } from '@/components/Form/FormFields'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const scope = this.$route.query['_scope']
    return {
      loading: true,
      scope: scope,
      scopeRole: scope + 'role',
      config: {
        url: `/api/v1/rbac/${scope}-roles/`,
        objectDetailRoute: { name: 'RoleDetail', query: { scope: scope }},
        initial: {
          scope: scope
        },
        fields: [
          [this.$t('Basic'), ['name', 'scope']],
          [this.$t('Permissions'), ['permissions']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta: {
          scope: {
            type: 'select',
            readonly: true
          },
          permissions: {
            component: TextReadonly,
            el: {
              text: this.$t('AddInDetailText'),
              bolder: false
            }
          }
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    getObjectDone(role) {
      this.config.url = `/api/v1/rbac/${role.scope?.value}-roles/`
    }
  }
}
</script>

<style lang="less" scoped>

</style>
