<template>
  <GenericCreateUpdatePage v-bind="config" @get-object-done="handleObjectDone" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'
import TextReadonly from '@/components/Form/FormFields/TextReadonly.vue'

export default {
  name: 'CreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      object: {},
      config: {
        url: '/api/v1/accounts/virtual-accounts/',
        object: {},
        fields: [
          [this.$t('Basic'), ['name', 'username']],
          [this.$t('Secret'), ['secret_from_login']]
        ],
        fieldsMeta: {
          name: {
            component: TextReadonly
          },
          username: {
            component: TextReadonly
          },
          secret_from_login: {
            hidden: () => {
              return this.object.alias !== '@USER'
            },
            readonly: this.$store.getters.publicSettings['CACHE_LOGIN_PASSWORD_ENABLED'] !== true
          }
        },
        updateSuccessNextRoute: { name: 'VirtualAccountDetail' }
      }
    }
  },
  methods: {
    handleObjectDone(object) {
      this.object = object
    }
  }
}
</script>

<style scoped>

</style>
