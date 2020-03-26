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
    /*background-color: white;*/
    margin-top: -30px;
  }

  .tabs-content>>> .el-tabs__header {
    background-color: white;
    margin-left: -25px;
    margin-right: -25px;
    padding: 0 0 0 25px;
  }

  .header {
    padding: 10px 20px;
    background-color: white;
  }

  .tabs-content >>> .el-tabs__nav div.el-tabs__item {
    /*margin-left: 10px;*/
  }
</style>
