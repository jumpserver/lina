<template>
  <BaseList v-bind="config" />
</template>

<script>
import BaseList from './components/BaseList'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      config: {
        category: 'database',
        url: '/api/v1/assets/databases/',
        headerActions: {
          extraActions: [
            {
              name: this.$t('CloudSync'),
              title: this.$t('CloudSync'),
              icon: 'cloud-provider',
              has: () => this.$hasPerm('xpack.view_account') && this.$hasLicense(),
              callback: () => this.$router.push(
                { name: 'CloudAccountList', query: { category: 'database' }}
              )
            }
          ]
        }
      }
    }
  }
}
</script>
