<template>
  <AllPreferenceUpdate :category="category" />
</template>

<script>

import AllPreferenceUpdate from '@/views/profile/UserSettingUpdate/AllPreferenceUpdate'

export default {
  name: 'LunaUpdate',
  components: {
    AllPreferenceUpdate
  },
  data() {
    return {
      category: 'luna'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
