<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :type="'success'" />
      <RelationCard v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard, QuickActions } from '@/components'

export default {
  name: 'UserInfo',
  components: {
    DetailCard,
    RelationCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
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
  methods: {
  }
}
</script>

<style scoped>

</style>
