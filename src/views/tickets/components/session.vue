<template>
  <IBox v-loading="loading" class="box">
    <div slot="header" class="clearfix ibox-title">
      <i class="fa fa-rocket" />
      {{ $t('sessions.session') }}
    </div>
    <div class="content">
      <el-row class="item">
        <el-col :span="4">
          <span class="item-label">状态：</span>
        </el-col>
        <el-col :span="20">
          <span class="item-value">阿达大厦</span>
        </el-col>
      </el-row>
      <el-row class="item">
        <el-col :span="4">
          <span class="item-label">状态：</span>
        </el-col>
        <el-col :span="20">
          <span class="item-value">阿达大厦</span>
        </el-col>
      </el-row>
    </div>
    <div class="bottom-btn">
      <el-button
        :disabled="object.status === 'closed'"
        type="danger"
        size="small"
        @click="handleReject"
      >
        <i class="fa fa-times" /> {{ $t('sessions.terminate') }}
      </el-button>
      <el-button
        :disabled="object.status === 'closed'"
        type="primary"
        size="small"
        @click="handleReject"
      >
        <i class="fa fa-check" /> {{ $t('sessions.sessionMonitor') }}
      </el-button>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'

export default {
  name: 'Comments',
  components: { IBox },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    reject: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      comments: '',
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      loading: false
    }
  },
  computed: {
  },
  mounted() {
    // this.getComment()
  },
  methods: {
    getComment() {
      this.loading = true
      const url = `/api/v1/tickets/comments/?ticket_id=${this.object.id}`
      this.$axios.get(url).then(res => {
        this.comments = res
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.loading = false
        this.form.comments = ''
      })
    },
    defaultReject() {
      const url = `/api/v1/tickets/tickets/${this.object.id}/reject/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleReject() {
      const handler = this.reject || this.defaultReject
      handler()
    },
    reloadPage() {
      window.location.reload()
    }
  }

}
</script>

<style lang='scss' scoped>
  .box {
    margin-top: 15px;
    margin-bottom: 15px;
  }
  .content {
    line-height: 2.5;
    font-size: 13px;
    color: #676A6C;
    .item-label {
      font-weight: 700;
    }
  }
  .bottom-btn {
    text-align: center;
    margin-top: 15px;
  }
</style>
