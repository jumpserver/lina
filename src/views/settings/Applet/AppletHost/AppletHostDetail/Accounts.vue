<template>
  <Account :columns-meta="columnsMeta" :object="object" />
</template>

<script lang="jsx">
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
          formatter: (row) => <span>{row.name}</span>
        },
        asset: {
          label: this.$t('Asset'),
          formatter: (row) => <span>{row.asset.name}</span>
        }
      }
    }
  }
}
</script>
