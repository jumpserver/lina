<template>
  <el-card class="ibox" shadow="never">
    <div slot="header" class="clearfix ibox-title" v-if="title">
      <h5>{{ title }}</h5>
      <div class="ibox-tools">
        <a class="collapse-link">
          <i class="fa fa-chevron-up" />
        </a>
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          <i class="fa fa-wrench" />
        </a>
        <a class="close-link">
          <i class="fa fa-times" />
        </a>
      </div>
    </div>
    <slot />
  </el-card>
</template>

<script>
export default {
  name: 'IBox',
  props: {
    title: {
      type: String,
      default: () => null
    }
  }
}
</script>

<style scoped>
  .ibox {
    height: 100%;
    clear: both;
    padding: 0;
    background-color: #ffffff;
  }

  .ibox >>> .el-card__header{
    background-color: #ffffff;
    border-color: #e7eaec;
    border-image: none;
    /*border-style: solid solid none;*/
    color: rgb(103, 106, 108);
    margin-bottom: 0;
    padding: 14px 15px 7px;
    min-height: 48px;
  }

  .ibox-title h5 {
    display: inline-block;
    font-size: 14px;
    margin: 0 0 7px;
    padding: 0;
    text-overflow: ellipsis;
    float: left;
  }

  .ibox-tools a {
    cursor: pointer;
    margin-left: 5px;
    color: #c4c4c4;
  }

  .ibox-tools {
    display: block;
    float: none;
    margin-top: 0;
    position: relative;
    padding: 0;
    text-align: right;
  }

  .fa {
    font-size: 14px;
  }

  .ibox >>> .el-card__body {
    background-color: #ffffff;
    padding: 15px 20px 20px 20px;
    color: inherit;
  }
</style>
