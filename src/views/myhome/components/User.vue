<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="title">
      <span>{{ $t('common.nav.Profile') }}</span>
    </div>
    <div class="content">
      <el-row :gutter="20">
        <el-col :span="5" class="left">
          <el-avatar :size="40" :src="avatarUrl" class="avatar" fit="fill" />
        </el-col>
        <el-col :span="18">
          <ul>
            <li><span class="title">{{ $t('audits.Username') }}</span>：<span>{{ users.name }}</span></li>
            <li><span class="title">{{ $t('users.Email') }}</span>：<span>{{ users.email }}</span></li>
            <li>
              <span class="title">{{ $t('audits.LoginDate') }}</span>：
              <span>{{ users.last_login | date }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
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
      users: {},
      avatarUrl: require('@/assets/img/avatar.png')
    }
  },
  created() {
    this.users = this.$store.state.users.profile || {}
  }
}
</script>

<style lang="scss" scoped>
ul, li {
  padding: 0;
  margin: 0;
  list-style: none
}

.box-card {
  margin-bottom: 20px;

  & > > > .el-card__header {
    padding-top: 20px;
  }
}

.content {
  overflow: hidden;

  .left {
    width: 70px;
    height: 70px;
    text-align: center;

    & > > > .el-avatar--large {
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
