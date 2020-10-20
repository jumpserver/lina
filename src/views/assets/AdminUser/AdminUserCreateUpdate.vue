
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
        [this.$t('common.Basic'), ['name', 'username', 'update_password', 'password', 'private_key']],
        [this.$t('common.Other'), ['comment']]
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
        update_password: {
          label: this.$t('users.UpdatePassword'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.update_password) {
              return true
            }
            return !this.$route.params.id
          }
        },
        password: {
          helpText: this.$t('common.passwordOrPassphrase'),
          hidden: (formValue) => {
            if (!this.$route.params.id) {
              return false
            }
            return !formValue.update_password
          }
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
