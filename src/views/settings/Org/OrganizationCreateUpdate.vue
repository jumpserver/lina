<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {},
        url: '/api/v1/orgs/orgs/',
        fields: [
          ['', ['name', 'comment']]
        ],
        hasSaveContinue: false,
        fieldsMeta: {},
        onPerformSuccess(res, method) {
          const orderParams = { params: { order: '-date_created' }}
          switch (method) {
            case 'post':
              this.$store.dispatch('users/addAdminOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('CreateSuccessMsg'))
              return this.$router.push({ name: 'OrganizationList', ...orderParams })
            case 'put':
              this.$store.dispatch('users/modifyOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('UpdateSuccessMsg'))
              return this.$router.push({ name: 'OrganizationList', ...orderParams })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
