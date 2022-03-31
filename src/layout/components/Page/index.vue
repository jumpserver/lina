<template>
  <div class="page">
    <PageHeading v-if="iTitle || helpMessage" class="disabled-when-print">
      <slot name="title">{{ iTitle }}</slot>
      <template #rightSide>
        <slot name="headingRightSide" />
      </template>
    </PageHeading>
    <PageContent>
      <el-alert v-if="helpMessage" type="success">
        <span class="announcement-main">{{ helpMessage }}</span>
      </el-alert>
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
      return this.title || this.$route.meta.title
    }
  }
}
</script>

<style scoped>
@media print {
  .disabled-when-print{
    display: none;
  }
  .enabled-when-print{
    display: inherit !important;
  }
  .print-margin{
    margin-top: 10px;
  }
  .announcement-main {
    word-wrap:break-word;
    white-space: pre-wrap;
  }
}
</style>
