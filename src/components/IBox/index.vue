<template>
  <el-card :class="'ibox ' + type" shadow="never" v-bind="$attrs">
    <div v-if="title" slot="header" class="clearfix ibox-title">
      <h5><i v-if="fa" :class="'fa ' + fa" /> {{ title }}</h5>
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
    },
    fa: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary'
    }
  },
  computed: {
    iClass() {
      return this.type
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

  .ibox >>> .el-card__header {
    border-color: #e7eaec;
    border-image: none;
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
