<template>
  <div class="page">
    <PageHeading>
      <slot name="title">{{ pageTitle }}</slot>
    </PageHeading>
    <PageContent>
      <slot name="content"></slot>
    </PageContent>
  </div>
</template>

<script>
import PageHeading from './PageHeading'
import PageContent from './PageContent'
export default {
  name: 'Page',
  components: {
    PageHeading,
    PageContent
  },
  props: {
    title: {
      type: String,
      default: () => null
    }
  },
  computed: {
    pageTitle() {
      // return ''
      return this.title || this.$tr(this.$route.meta.title)
    }
  }
}
</script>

<style scoped>

</style>
