<template>
  <Page>
    <el-row :gutter="10">
      <el-col :span="4" style="padding: 10px;">
        <div class="tag-container">
          <h5>报表类型</h5>
          <ul class="folder-list m-b-md" style="padding: 0">
            <li v-for="chart in charts" :key="chart.name">
              <a @click="component = chart.component"> <i :class="chart.icon" /> {{ chart.name }} </a>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="20" style="background-color: #fff" class="chart">
        <component :is="component" :nav="false" />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import UserActivity from './UserActivity.vue'
import Page from '@/layout/components/Page'

export default {
  name: 'Users',
  components: {
    UserActivity,
    Page
  },
  data() {
    return {
      component: 'UserActivity',
      charts: [
        {
          name: '用户登录趋势',
          icon: 'fa fa-user-o',
          url: '/reports/users/user-activity'
        },
        {
          name: '用户密码更改',
          icon: 'fa fa-envelope-o',
          url: '/reports/users/user-activity'
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  ::v-deep .page-content {
    padding-right: 20px;
    padding-top: 10px;
  }
}

h5 {
  font-size: 13px;
}

.folder-list li {
  border-bottom: 1px solid #e7eaec;
  display: block;
  font-size: 13px;
  padding: 5px 0;

  .fa {
    margin-right: 10px;
  }
}
.tag-container {
  border-radius: 5px;
}
.chart {
  ::v-deep .content {
    background-color: #fff;
    overflow-y: hidden !important;
    height: 100%;
  }
}
</style>
