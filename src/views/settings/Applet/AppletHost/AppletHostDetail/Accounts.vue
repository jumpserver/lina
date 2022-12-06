<template>
  <Account :object.sync="object" />
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
    }
  }
}
</script>

<style scoped>

</style>
