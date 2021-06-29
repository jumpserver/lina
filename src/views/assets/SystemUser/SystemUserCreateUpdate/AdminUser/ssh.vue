<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    v-bind="$attrs"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { UploadKey } from '@/components'

export default {
  name: 'AdminUserSSH',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol', 'username']],
        [this.$t('common.Auth'), ['update_password', 'password', 'private_key']],
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
        protocol: {
          el: {
            style: 'width:100%',
            disabled: true
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
