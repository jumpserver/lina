<template>
  <Page>
    <div class="box-container" @click="handleClick">
      <el-card class="box-card">
        <div class="card-title">
          <i class="el-icon-user" />
          <span class="chart-container-title-text">用户登录趋势</span>
        </div>
        <div class="card-description">
          <span class="chart-container-title-text">用户最近的登录行为，最近7天登录用户数，或者是最近7天登录用户数趋势</span>
        </div>
      </el-card>

      <el-card class="box-card">
        <div class="card-title">
          <i class="el-icon-user" />
          <span class="chart-container-title-text">用户登录趋势</span>
        </div>
        <div class="card-description">
          <span class="chart-container-title-text">用户最近的登录行为，最近7天登录用户数，或者是最近7天登录用户数趋势</span>
        </div>
      </el-card>

      <el-card class="box-card">
        <div class="card-title">
          <i class="el-icon-user" />
          <span class="chart-container-title-text">用户登录趋势</span>
        </div>
        <div class="card-description">
          <span class="chart-container-title-text">用户最近的登录行为，最近7天登录用户数，或者是最近7天登录用户数趋势</span>
        </div>
      </el-card>
    </div>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'

export default {
  name: 'Assets',
  components: {
    Page
  },
  data() {
    return {
      win: null
    }
  },
  methods: {
    handleClick(item) {
      const url = '/reports/users/users/user-activity2'
      try {
        if (!this.win || this.win.closed) {
          // 计算窗口居中位置
          const width = 1000
          const height = 800
          const left = (screen.width - width) / 2
          const top = (screen.height - height) / 2

          this.win = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`)
        }
        // 确保窗口在最前面
        this.win.focus()
        this.win.location.href = url
      } catch (error) {
        console.error('打开新窗口失败:', error)
        // 降级处理：在当前窗口打开
        window.location.href = url
      }
    }
  }
}
</script>
<style scoped lang="scss">
.box-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  line-height: 30px;
}
.card-description {
  font-size: 13px;
  margin-top: 20px;
}

.box-card {
  width: 350px;
  height: 200px;

  &:hover {
    // box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid var(--color-primary);
    cursor: pointer;
  }
}
</style>
