
<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Uploadkey from '@/components/UploadKey'
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
        [this.$t('common.BasicInfo'), ['name', 'username', 'password', 'private_key', 'comment']]
      ],
      fieldsMeta: {
        name: {
          el: {
            placeholder: this.$t('common.Name')
          }
        },
        username: {
          el: {
            placeholder: this.$t('common.Username')
          }
        },
        password: {
          helpText: this.$t('common.passwordOrPassphrase')
        },
        private_key: {
          component: Uploadkey
        }
      },
      url: '/api/v1/assets/admin-users/'
    }
  }
}
</script>

<style>

</style>
