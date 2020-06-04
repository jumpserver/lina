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
      url: '/api/v1/assets/asset-users/',
      initial: {

      },
      fields: [
        ['', ['asset', 'username', 'password', 'private_key', 'comment']]
      ],
      fieldsMeta: {
        asset: {
          label: this.$t('perms.Asset'),
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/assets/',
              transformOption: (item) => {
                return { label: `${item.hostname}(${item.ip})`, value: item.id }
              }
            }
          }
        },
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
      }
    }
  }
}
</script>

<style>

</style>
