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
        onPerformSuccess(res, method, vm) {
          switch (method) {
            case 'post':
              this.$store.dispatch('users/addAdminOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('CreateSuccessMsg'))
              break
            case 'put':
              this.$store.dispatch('users/modifyOrg', { id: res.id, name: res.name })
              this.$message.success(this.$tc('UpdateSuccessMsg'))
              break
          }

          this.$emit('submitSuccess', res)

          if (!vm.drawer) {
            const orderParams = { params: { order: '-date_created' } }
            setTimeout(() => {
              this.$router.push({ name: 'OrganizationList', ...orderParams })
            }, 100)
          } else {
            this.$store.dispatch('common/finishDrawerActionMeta', { action: vm.action, row: res })
          }
        }
      }
    }
  }
}
</script>
