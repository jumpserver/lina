<template>
  <Hcard v-bind="cardConfig">
    <div class="content">
      <ul>
        <li v-for="(i, index) in cardConfig.dataArr" :key="index" class="item">
          <span>{{ i18n.t('sessions.user') }}: {{ i.user }}</span>&nbsp;
          <span>{{ i18n.t('sessions.remoteAddr') }}：{{ i.remote_addr }}</span>&nbsp;
          <span>{{ i18n.t('sessions.loginFrom') }}：{{ i.login_from_display }}</span>&nbsp;
          <el-button
            type="text"
            icon="el-icon-link"
            :disabled="i.id ? false : true"
            @click="onJump(i)"
          >
            {{ i18n.t('perms.connect') }}
          </el-button>
        </li>
      </ul>
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
        title: this.$t('route.SessionOffline'),
        icon: 'fa-rocket',
        dataArr: []
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$axios(`/api/v1/terminal/sessions/?is_finished=1`).then((res) => {
        if (res && res.length > 0) {
          this.cardConfig.dataArr = res.slice(0, 10)
        }
      })
    },
    onJump(i) {
      if (i.id) {
        this.$router.push(`/terminal/sessions/${i.id}`)
      }
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
    &>>> .el-button {
      padding: 0px 20px;
    }
  }
}

</style>
