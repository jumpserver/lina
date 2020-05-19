<template>
  <div>
    <small>过去一周, 共有 2 位用户登录 31 次资产.</small>
    <ul class="list-group clear-list m-t">
      <li v-for="(item, index) of summaryItems" :key="item.username" class="list-group-item fist-item">
        <span class="pull-right">
          {{ item.count }} 次/周
        </span>
        <el-tag effect="dark" size="small" :type="getLabelType(index)">{{ index + 1 }}</el-tag>
        {{ item.username }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'LoginTop',
  data() {
    return {
      summaryItems: [
        {
          username: '周杰伦',
          count: 42
        },
        {
          username: '林俊杰',
          count: 30
        },
        {
          username: '蔡依林',
          count: 28
        },
        {
          username: '梁静茹',
          count: 26
        },
        {
          username: '孙燕姿',
          count: 22
        }
      ],
      tabsType: ['success', 'info', 'primary', 'default', 'info']
    }
  },
  methods: {
    getLabelType(index) {
      return this.tabsType[index] || 'primary'
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
    margin-bottom: 20px;
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
