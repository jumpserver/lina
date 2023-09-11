<template>
  <AllPreferenceUpdate :category="category" />
</template>

<script>

import AllPreferenceUpdate from '@/views/profile/UserSettingUpdate/AllPreferenceUpdate'

export default {
  name: 'LinaUpdate',
  components: {
    AllPreferenceUpdate
  },
  data() {
    return {
      category: 'lina'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
