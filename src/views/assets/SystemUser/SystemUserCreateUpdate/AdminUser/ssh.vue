<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" :title="title" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { UploadKey } from '@/components'

export default {
  name: 'AdminUserSSH',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      title: this.$t('route.SystemUserCreate') + ' - ' + this.$t('assets.AdminUser'),
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
          component: UploadKey
        }
      },
      url: '/api/v1/assets/system-users/'
    }
  },
  method: {
  }
}
</script>

<style lang='less' scoped>

</style>
