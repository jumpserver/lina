<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'
import TextReadonly from '@/components/Form/FormFields/TextReadonly.vue'

export default {
  name: 'CreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      config: {
        url: '/api/v1/accounts/virtual-accounts/',
        fields: [
          [this.$t('common.Basic'), ['name', 'username']],
          [this.$t('assets.Secret'), ['secret_from_login']]
        ],
        fieldsMeta: {
          name: {
            component: TextReadonly
          },
          username: {
            component: TextReadonly
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
