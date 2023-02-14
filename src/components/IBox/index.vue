<template>
  <el-card :class="'ibox ' + type" shadow="never" v-bind="$attrs">
    <template #header>
      <slot name="header">
        <div v-if="title" slot="header" class="clearfix ibox-title">
          <i v-if="fa" :class="'fa ' + fa" /> <h5>{{ title }}</h5>
        </div>
      </slot>
    </template>
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
      default: 'default'
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
    /*height: 100%;*/
    clear: both;
    padding: 0;
  }

  .ibox >>> .el-card__header {
    border-color: #e7eaec;
    border-image: none;
    margin-bottom: 0;
    padding: 10px 15px;
    min-height: 30px;
    line-height: 1.32;
    font-weight: normal;
  }

  .ibox-title h5 {
    display: inline-block;
    font-size: 13px;
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    font-weight: 500;
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
    padding: 15px 30px 20px 30px;
    color: inherit;
  }
</style>
