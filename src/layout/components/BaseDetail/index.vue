<template>
  <Page>
    <span slot="title">
      <slot name="name" />
    </span>
    <div slot="content" class="tabs-view">
      <slot name="content" />
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
export default {
  name: 'BaseDetail',
  components: {
    Page
  }
}
</script>

<style scoped>
  .tabs-view {
    /*background-color: white;*/
    margin-top: -30px;
  }

  .tabs-view >>> .el-tabs__header {
    background-color: white;
    margin-left: -25px;
    margin-right: -25px;
    padding: 0 0 0 25px;
  }

  .header {
    padding: 10px 20px;
    background-color: white;
  }

  .tabs-view >>> .el-tabs__nav div.el-tabs__item {
    /*margin-left: 10px;*/
  }
</style>
