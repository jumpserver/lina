<template>
  <AllPreferenceUpdate :category="category" />
</template>

<script>

import AllPreferenceUpdate from '@/views/profile/UserSettingUpdate/AllPreferenceUpdate'

export default {
  name: 'KokoUpdate',
  components: {
    AllPreferenceUpdate
  },
  data() {
    return {
      category: 'koko'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
