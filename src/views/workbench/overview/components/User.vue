<template>
  <el-card class="box-card no-border" shadow="never">
    <template #header>
      <div class="title">
        <span>{{ $t('YourProfile') }}</span>
      </div>
    </template>
    <div class="content">
      <el-row :gutter="20">
        <el-col :span="5" class="left">
          <el-avatar :size="40" :src="avatarUrl" class="avatar" fit="fill" />
        </el-col>
        <el-col :md="20" :sm="24">
          <ul>
            <li>
              <span class="title">{{ $t('Username') }}:</span><span>{{ users.name }}</span>
            </li>
            <li>
              <span class="title">{{ $t('Email') }}:</span><span>{{ users.email }}</span>
            </li>
            <li>
              <span class="title">{{ $t('LoginDate') }}:</span>
              <span>{{ toSafeLocalDateStr(users.last_login) }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import { useDateTime } from '@/composables/useDateTime'
import { getAssetUrl } from '@/utils/assets'

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
      avatarUrl: getAssetUrl('img/avatar.png')
    }
  },
  setup() {
    return useDateTime()
  },
  created() {
    this.users = this.$store.state.users.profile || {}
  }
}
</script>

<style lang="scss" scoped>
ul,
li {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  display: flex !important;
  width: 100%;

  span {
    display: inline-block;
    min-width: 100px;
  }
}

//
//.box-card {
//  margin-bottom: 20px;
//
//  & :deep(.el-card__header) {
//    padding-top: 20px;
//  }
//}

.content {
  overflow: hidden;

  .left {
    width: 70px;
    height: 70px;
    text-align: center;

    & :deep(.el-avatar--large) {
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
      color: var(--color-text-primary);
    }
  }
}

.title {
  font-weight: 500;
}
</style>
