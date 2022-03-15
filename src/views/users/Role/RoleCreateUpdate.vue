<template>
  <GenericCreateUpdatePage v-bind="config" @getObjectDone="getObjectDone" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Text } from '@/components/FormFields'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const scope = this.$route.query['scope']
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
          [this.$t('common.Basic'), ['name', 'scope']],
          [this.$t('perms.Permissions'), ['permissions']],
          [this.$t('common.Other'), ['comment']]
        ],
        fieldsMeta: {
          scope: {
            type: 'select',
            readonly: true
          },
          permissions: {
            component: Text,
            el: {
              text: this.$t('users.HelpText.addRolePermissions')
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
      this.config.url = `/api/v1/rbac/${role.scope}-roles/`
    }
  }
}
</script>

<style lang="less" scoped>

</style>
