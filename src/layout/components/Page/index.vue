<template>
  <div class="page">
    <PageHeading>
      <slot name="title">{{ pageTitle }}</slot>
      <span slot="rightSide">
        <slot name="headingRightSide" />
      </span>
    </PageHeading>
    <PageContent>
      <slot name="content" />
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
      default: ''
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
