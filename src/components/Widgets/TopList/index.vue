<template>
  <div>
    <small v-if="msg">{{ msg }}</small>
    <ul class="list-group clear-list m-t">
      <li v-for="(item, index) of items" :key="item.name" class="list-group-item">
        <span class="pull-right">
          {{ item.count }} {{ unit }}
        </span>
        <el-tag :type="getLabelType(index)" effect="dark" size="small">
          {{ index + 1 }}
        </el-tag>
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'LoginList',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    unit: {
      type: String,
      default: 'times'
    },
    msg: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabsType: ['success', 'info', 'primary', 'default', 'info'],
      indexLabels: []
    }
  },
  methods: {
    getLabelType(index) {
      const i = Math.floor(Math.random() * 4)
      // const i = index % 5
      const type = this.tabsType[i] || 'primary'
      if (this.indexLabels[index - 1] === type) {
        return this.getLabelType(index)
      }
      this.indexLabels[index] = type
      return type
    }
  }
}
</script>

<style lang="scss" scoped>
  .m-t {
    margin-top: 15px;
  }

  .list-group {
    padding-left: 0;
    margin-bottom: 0;
  }

  .list-group.clear-list .list-group-item {
    border-top: 1px solid #e7eaec;
    border-bottom: 0;
    border-right: 0;
    border-left: 0;
    padding: 8px 0;
  }

  .list-group-item:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-top: none !important;
  }

  .list-group-item {
    background-color: inherit;
    border: 1px solid #e7eaec;
    display: block;
    margin-bottom: -1px;
    padding: 8px 15px;
    position: relative;
    font-size: 13px;
    line-height: 18px;
  }

  .el-tag--small {
    height: 24px;
    font-size: 75%;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    line-height: 16px;
    margin-right: 10px;
    font-weight: 600;
    padding: 3px 8px;
    text-shadow: none;
  }
</style>
