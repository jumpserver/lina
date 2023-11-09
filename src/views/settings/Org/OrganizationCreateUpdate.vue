<template>
  <GenericCreateUpdateDrawer v-bind="config" />
</template>

<script>
import { GenericCreateUpdateDrawer } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      config: {
        initial: {
        },
        url: '/api/v1/orgs/orgs/',
        fields: [
          ['', ['name', 'comment']]
        ],
        hasSaveContinue: false,
        fieldsMeta: {
        },
        onPerformSuccess(res, method) {
          switch (method) {
            case 'post':
              this.$store.dispatch('users/addAdminOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('common.createSuccessMsg'))
              return this.$router.push({ name: 'OrganizationList' })
            case 'put':
              this.$store.dispatch('users/modifyOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('common.updateSuccessMsg'))
              return this.$router.push({ name: 'OrganizationList' })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
