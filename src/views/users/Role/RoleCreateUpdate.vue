<template>
  <GenericCreateUpdateDrawer v-if="!loading" v-bind="config" @getObjectDone="getObjectDone" />
</template>

<script>
import { TextReadonly } from '@/components/Form/FormFields'
import { GenericCreateUpdateDrawer } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    const tab = this.$route.query['tab']
    const scope = tab === 'SysRoleList' ? 'system' : 'org'
    console.log('scope', scope)
    return {
      loading: true,
      scope: scope,
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
            component: TextReadonly,
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
      this.config.url = `/api/v1/rbac/${role.scope?.value}-roles/`
    }
  }
}
</script>

<style lang="less" scoped>

</style>
