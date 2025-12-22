<template>
  <div v-if="$hasPerm('accounts.view_changesecretautomation')" class="change-secret-container">
    <ChangeSecretReport :nav="false" :only-charts="true" />
  </div>
</template>

<script>
import ChangeSecretReport from '@/views/reports/pam/ChangeSecret/index.vue'

export default {
  name: 'ChangeSecret',
  components: {
    ChangeSecretReport
  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
