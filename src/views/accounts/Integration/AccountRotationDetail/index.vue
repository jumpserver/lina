<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="object"
  >
    <keep-alive>
      <component
        :is="config.activeMenu"
        :object="object"
        @refresh="handleRefresh"
        @reload-table="$emit('reload-table')"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountRotationInfo from './AccountRotationInfo.vue'

const valueOf = (value) => value?.value ?? value

export default {
  name: 'AccountRotationDetail',
  components: {
    AccountRotationInfo,
    GenericDetailPage
  },
  emits: ['reload-table'],
  data() {
    return {
      object: {},
      config: {
        url: '/api/v1/accounts/credential-policies',
        activeMenu: 'AccountRotationInfo',
        actions: {
          hasDelete: false,
          canUpdate: () => valueOf(this.object.status) === 'idle',
          updateRoute: { name: 'CredentialPolicyUpdate' }
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountRotationInfo'
          }
        ]
      }
    }
  },
  methods: {
    handleRefresh(policy) {
      this.object = policy
    }
  }
}
</script>
