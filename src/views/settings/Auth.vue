<template>
  <div>
    <WeCom />
    <DingTalk />
  </div>
</template>

<script>
import WeCom from '@/views/settings/oauth/WeCom'
import DingTalk from '@/views/settings/oauth/DingTalk'

export default {
  name: 'Auth',
  components: {
    WeCom,
    DingTalk
  },
  data() {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
