<template>
  <div class="page">
    <PageHeading>
      <slot name="title">{{ pageTitle }}</slot>
      <span slot="actions">
        <slot name="actions" />
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
    PageContent,
  },
  props: {
    title: {
      type: String,
      default: () => null
    },
    submenu: {
      type: Array,
      default: () => []
    },
    activeName: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      actions: [
        {
          name: 'update',
          title: 'Update',
          icon: 'el-icon-edit'
        }
      ]
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
