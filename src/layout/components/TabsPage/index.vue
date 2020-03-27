<template>
  <Page>
    <span slot="title">
      <slot name="title" />
    </span>
    <div slot="content" class="tabs-content">
      <slot name="content" />
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
export default {
  name: 'TabsPage',
  components: {
    Page
  }
}
</script>

<style scoped>
  .tabs-content {
    margin-top: -30px;
  }

  .tabs-content >>> .el-tabs__header {
    background-color: white;
    border-bottom: #e5e7ed solid 1px;
    margin-left: -25px;
    padding-left: 25px;
    margin-right: -25px;
    padding-right: 25px;
  }
</style>
