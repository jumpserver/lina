<template>
  <el-row>
    <DetailCard :title="cardTitle" :items="detailCardItems">
      <div class="feed-activity-list">
        <div class="feed-element">
          <a href="#" class="pull-left">
            <el-avatar :src="imageUrl" class="header-avatar" />
          </a>
          <div class="media-body ">
            <strong>{{ object.user_display }}</strong> <small class="text-muted"> {{ object.date_created }}</small>
            <br>
            <small class="text-muted">{{ object.date_created }} </small>
            <div style="padding-top: 10px">
              <span v-html="object.body" />
            </div>
          </div>
        </div>
        <template v-if="object.status === 'closed'">
          <div v-for="item in comments" :key="item.user_display + item.body">
            <div class="feed-element">
              <a href="#" class="pull-left">
                <el-avatar :src="imageUrl" class="header-avatar" />
              </a>
              <div class="media-body ">
                <strong>{{ item.user_display }}</strong> <small class="text-muted">{{ item.date_created }}</small>
                <br>
                <small class="text-muted">{{ item.date_created }}</small>
                <div style="padding-top: 10px">
                  {{ item.body }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <el-form ref="comments" :model="form" label-width="80px" style="padding-top: 20px">
          <el-form-item label="审批备注">
            <el-input v-model="form.comments" type="textarea" :autosize="{ minRows: 4 }" />
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" size="small" :disabled="object.status === 'closed'" @click="handleApprove"><i class="fa fa-check" />同意</el-button>
            <el-button type="warning" size="small" :disabled="object.status === 'closed'" @click="handleReject"><i class="fa fa-ban" />拒绝</el-button>
            <el-button type="danger" size="small" :disabled="object.status === 'closed'" @click="handleClosed"><i class="fa fa-times" />关闭</el-button>
            <el-button type="info" size="small" :disabled="object.status === 'closed'" @click="handleComment"><i class="fa fa-pencil" />备注</el-button>
          </el-form-item>
        </el-form>
      </div>
    </DetailCard>
  </el-row>
</template>

<script>
import { DetailCard } from '@/components'

export default {
  name: 'TicketDetail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      title: '登录复核a-2(a-2)',
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: []
    }
  },
  computed: {
    cardTitle() {
      return this.object.title
    },
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.user'),
          value: this.object.user_display
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: this.object.status
        },
        {
          key: this.$t('tickets.Assignees'),
          value: this.object.assignees_display
        },
        {
          key: this.$t('tickets.Assignee'),
          value: '需要处理'
        },
        {
          key: this.$t('common.DateCreated'),
          value: this.object.date_created
        }
      ]
    }
  },
  mounted() {
    const url = `/api/v1/tickets/tickets/${this.object.id}/comments/`
    this.$axios.get(url).then(res => {
      this.comments = res
    }).catch(err => this.$message.error(this.$t(err)))
  },
  methods: {
    handleApprove() {
      console.log('点击同意=====================')
    },
    handleReject() {
      console.log('点击拒绝=====================')
    },
    handleClosed() {
      console.log('点击关闭=====================')
    },
    handleComment() {
      console.log('点击备注=====================')
    }
  }
}
</script>

<style scoped>
  .feed-activity-list {
    padding-top: 20px;
  }
  .feed-activity-list .feed-element {
    border-bottom: 1px solid #e7eaec;
  }
  .feed-element:first-child {
    margin-top: 0;
  }
  .feed-element {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .feed-element,
  .feed-element .media {
    margin-top: 15px;
  }
  .feed-element,
  .media-body {
    overflow: hidden;
  }
  .feed-element > .pull-left {
    margin-right: 10px;
  }
  .feed-element .header-avatar {
    width: 38px;
    height: 38px;
  }
  .feed-element .well {
    border: 1px solid #e7eaec;
    box-shadow: none;
    margin-top: 10px;
    margin-bottom: 5px;
    padding: 10px 20px;
    font-size: 11px;
    line-height: 16px;
  }
  .feed-element .actions {
    margin-top: 10px;
  }
  .feed-element .photos {
    margin: 10px 0;
  }
  .text-muted {
    color: #888888;
  }
</style>
