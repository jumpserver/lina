<template>
  <Hcard v-bind="cardConfig">
    <div class="content">
      <ul v-if="dataArr.length > 0">
        <li v-for="(i, index) in dataArr" :key="index" class="item">
          <span>{{ i18n.t('audits.LoginIP') }} {{ i.ip }}</span>&nbsp;
          <span>{{ i18n.t('audits.LoginCity') }}：{{ i.city }}</span>&nbsp;
          <span>{{ i18n.t('audits.LoginDate') }}：{{ i.datetime }}</span>
        </li>
      </ul>
      <div v-else class="other">
        <i class="icon el-icon-folder-opened" />
        <div>{{ this.$t('common.NoData') }}</div>
      </div>
    </div>
  </Hcard>
</template>

<script>
import Hcard from './Hcard.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Hannouncement',
  components: {
    Hcard
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: '登录日志'
      },
      dataArr: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$axios(`/api/v1/audits/login-logs/`).then((res) => {
        if (res && res.length > 0) {
          this.dataArr = res.slice(0, 5)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
ul,li {
  padding: 0;
  margin: 0;
  list-style: none
}
.content {
  width: 100%;
  .item {
    display: flex;
    margin-bottom: 16px;
    cursor: pointer;
    font-size: 14px;
    &:last-child {
      margin-bottom: 0;
    }
    .left {
      display: inline-block;
      flex: 0 0 34px;
      margin-right: 8px;
      color: #8b9db6;
      text-align: center;
      font-size: 0;
    }
    .right {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
}
.other {
  width: 100%;
  height: auto;
  text-align: center;
  .icon {
    text-align: center;
    font-size: 30px;
  }
}

</style>
