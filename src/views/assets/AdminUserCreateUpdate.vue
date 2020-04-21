
<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'AdminUserCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {

      },
      fields: [
        [this.$t('perms.' + 'Basic'), ['name', 'username', 'password', 'private_key', 'comment']]
      ],
      fieldsMeta: {
        private_key: {
        }
      },
      url: '/api/v1/assets/admin-users/'
    }
  }
}
</script>

<style>

</style>
