<template>
  <div class="page">
    <PageHeading>
      <slot name="title">{{ iTitle }}</slot>
      <template #rightSide>
        <slot name="headingRightSide" />
      </template>
    </PageHeading>
    <PageContent>
      <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
      <slot />
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
    },
    helpMessage: {
      type: String,
      default: ''
    }
  },
  computed: {
    iTitle() {
      // return ''
      return this.title || this.$tr(this.$route.meta.title)
    }
  }
}
</script>

<style scoped>

</style>
