<template>
  <div class="page">
    <PageHeading :title="title"></PageHeading>
    <div class="wrapper-content">
    </div>
  </div>
</template>

<script>
import PageHeading from './PageHeading'
export default {
  name: 'Page',
  components: {
    PageHeading
  },
  props: {
    title: {
      type: String,
      default: () => 'Page title'
    }
  }
}
</script>

<style scoped>

</style>
