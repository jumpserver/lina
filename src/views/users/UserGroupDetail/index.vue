<template>
  <TabsPage>
    <span slot="title">{{ group.name }}</span>
    <el-tabs slot="content">
      <el-tab-pane label="用户管理" name="first">
        <el-card class="box-card">
          <div v-for="o in 4" :key="o" class="text item">
            {{ '列表内容 ' + o }}
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
    </el-tabs>
  </TabsPage>
</template>

<script>
import { getUserGroup } from '@/api/user'
import { TabsPage } from '@/layout/components'

export default {
  components: {
    TabsPage
  },
  data() {
    return {
      activeName: 'first',
      group: { name: '' }
    }
  },
  mounted() {
    this.getGroupDetail()
  },
  methods: {
    getGroupDetail() {
      getUserGroup(this.$route.params.id).then(response => {
        this.group = response
      })
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
