
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
        ['', ['name', 'username', 'password', 'private_key', 'comment']]
      ],
      fieldsMeta: {
        name: {
          el: {
            placeholder: this.$t('名称')
          }
        },
        username: {
          el: {
            placeholder: this.$t('用户名')
          }
        },
        password: {
          helpText: this.$t('密码或密钥密码')
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
