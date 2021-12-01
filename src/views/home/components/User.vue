<template>
  <el-card class="box-card">
    <div slot="header" class="title">
      <span>{{ i18n.t('common.nav.Profile') }}</span>
    </div>
    <div class="content">
      <el-row :gutter="20">
        <el-col :span="5" class="left">
          <el-avatar fit="fill" class="avatar" :size="60" :src="users.avatar_url" />
        </el-col>
        <el-col :span="18">
          <ul>
            <li><span class="title">{{ i18n.t('audits.Username') }}</span>：<span>{{ users.name }}</span></li>
            <li><span class="title">{{ i18n.t('users.Email') }}</span>：<span>{{ users.email }}</span></li>
            <li><span class="title">{{ i18n.t('audits.LoginDate') }}</span>：<span>{{ this.$moment(users.last_login).format('YYYY-MM-DD HH:mm:ss') }}</span></li>
          </ul>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import i18n from '@/i18n/i18n'
export default {
  name: 'Huser',
  props: {
    title: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      i18n,
      users: {}
    }
  },
  created() {
    this.users = this.$store.state.users.profile || {}
  }
}
</script>

<style lang="scss" scoped>
ul,li {
  padding: 0;
  margin: 0;
  list-style: none
}
.box-card {
  box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
  margin-bottom: 20px;
  &:hover {
    box-shadow: 0 4px 5px 0 rgb(54 58 80 / 42%);
  }
  &>>> .el-card__header {
    padding-top: 20px;
  }
}
.content {
  overflow: hidden;
  .left {
    width: 70px;
    height: 70px;
    text-align: center;
    &>>> .el-avatar--large {
      width: 100%;
      height: 100%;
    }
  }
  li {
    display: block;
    font-size: 13px;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .title {
      color: #303133;
    }
  }
}
.title {
  font-weight: 500;
}
</style>
