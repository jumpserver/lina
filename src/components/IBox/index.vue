<template>
  <el-card :class="'ibox ' + type" shadow="never" v-bind="$attrs">
    <div v-if="title" slot="header" class="clearfix ibox-title">
      <i v-if="fa" :class="'fa ' + fa" /> {{ title }}
      <span v-if="label.title" :class="'label label-' + label.type">{{ label.title }}</span>
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
      default: 'default'
    },
    label: {
      type: Object,
      default() {
        return {
          type: 'success',
          title: ''
        }
      }
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
    background-color: #ffffff;
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
    font-size: 14px;
    margin: 0;
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

  .label-success {
    background-color: #1c84c6;
    color: #FFFFFF;
  }

  .label-info {
    background-color: #23c6c8;
    color: #FFFFFF;
  }

  .label-primary {
    background-color: #1ab394;
    color: #FFFFFF;
  }

  .label-danger {
    background-color: #ed5565;
    color: #FFFFFF;
  }

  .label {
    display: inline;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25em;
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 600;
    font-size: 10px;
    padding: 3px 8px;
    margin-left: 4px;
    text-shadow: none;
    float: right!important;
  }

  .ibox >>> .el-card__body {
    background-color: #ffffff;
    padding: 15px 20px 20px 20px;
    color: inherit;
  }
</style>
