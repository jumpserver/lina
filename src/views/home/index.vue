<template>
  <div class="home">
    <NavHeader />
    <Dashboard />
  </div>
</template>

<script>
import { NavHeader } from '@/layout/components'
import Dashboard from '@/views/dashboard'

export default {
  name: 'Name',
  components: {
    NavHeader,
    Dashboard
  }
}

</script>

<style lang="scss" scoped>
  .home {
    background-color: #f3f3f4;
  }
</style>
