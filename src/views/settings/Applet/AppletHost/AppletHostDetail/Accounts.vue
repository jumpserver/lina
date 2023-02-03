<template>
  <Account :object.sync="object" :columns-meta="columnsMeta" />
</template>

<script>
import Account from '@/views/assets/Asset/AssetDetail/Account'
export default {
  name: 'Accounts',
  components: {
    Account
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      columnsMeta: {
        name: {
          label: this.$t('assets.Asset'),
          formatter: (row) => <span>{row.asset.name}</span>
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
