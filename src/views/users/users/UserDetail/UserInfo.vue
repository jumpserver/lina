<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary">
        <table>
          <tr>
            <td>激活中:</td>
            <td>
              <span>
                <Switcher v-model="value" />
              </span>
            </td>
          </tr>
          <tr>
            <td>多因子认证:</td>
            <td>
              <span>
                <el-slider
                  v-model="value2"
                  :min="0"
                  :max="2"
                  :step="1"
                  format-tooltip=""
                  show-stops
                  style="width: 50px"
                />
              </span>
            </td>
          </tr>
          <tr>
            <td>重置多因子认证:</td>
            <td>
              <span>
                <el-button type="primary" size="mini">重置</el-button>
              </span>
            </td>
          </tr>
          <tr>
            <td>发送重置密码邮件:</td>
            <td>
              <span>
                <el-button type="primary" size="mini">发送</el-button>
              </span>
            </td>
          </tr>
          <tr>
            <td>发送重置密钥邮件:</td>
            <td>
              <span>
                <el-button type="primary" size="mini">发送</el-button>
              </span>
            </td>
          </tr>

          <tr style="display:none">
            <td>解除登录限制</td>
            <td>
              <span>
                <el-button type="primary" size="mini">解除</el-button>
              </span>
            </td>
          </tr>
        </table>
      </QuickActions>
      <RelationCard type="info" style="margin-top: 15px" v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard, QuickActions, Switcher } from '@/components'

export default {
  name: 'UserInfo',
  components: {
    DetailCard,
    RelationCard,
    QuickActions,
    Switcher
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      value: false,
      value2: 0,
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('users.User groups'),
        objectsAjax: {
          url: '/api/v1/users/groups/?fields_size=mini&order=name'
        },
        hasObjectsId: this.object.groups,
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/users/users-groups-relations/?user=${objectId}&usergroup=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/users/users-groups-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              usergroup: v.value,
              user: objectId
            }
          })
          return this.$axios.post(relationUrl, data)
        }
      },
      cardTitle: this.$tc('Basic Info')
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$tc('Name'),
          value: this.object.name
        },
        {
          key: this.$tc('Username'),
          value: this.object.username
        },
        {
          key: this.$tc('Email'),
          value: this.object.email
        },
        {
          key: this.$tc('Role'),
          value: this.object.role_display
        },
        {
          key: this.$t('users.MFA'),
          value: this.object.mfa_level_display
        },
        {
          key: this.$t('users.Source'),
          value: this.object.source_display
        },
        {
          key: this.$tc('Date expired'),
          value: this.object.date_expired
        },
        {
          key: this.$tc('Created by'),
          value: this.object.created_by
        },
        {
          key: this.$tc('Date Created'),
          value: this.object.date_joined
        },
        {
          key: this.$t('users.Date last login'),
          value: this.object.last_login
        },
        {
          key: this.$t('users.Date password updated'),
          value: this.object.date_password_last_updated
        },
        {
          key: this.$tc('Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  watch: {
    group(iNew, iOld) {
      this.$log.debug('Group has changed')
      this.relationConfig.hasObjectsId = iNew.users
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
