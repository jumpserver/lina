<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="adminReletionConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="userReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard } from '@/components'

export default {
  name: 'OrganizationDetail',
  components: {
    DetailCard,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      userReletionConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.User'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.users,
        performAdd: (items) => {
          // const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${this.$route.params.id}/`
          const usersId = items.map(v => v.value)
          const data = { users: usersId }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          // const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${this.$route.params.id}/`
          const objectOldRelationUsers = this.object.users
          const objectNewRelationUsers = objectOldRelationUsers.filter(v => v !== item.value)
          const data = { users: objectNewRelationUsers }
          return this.$axios.patch(relationUrl, data)
        }
      },
      adminReletionConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.Admin'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.admin_users,
        performAdd: (items) => {
          // const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${this.$route.params.id}/`
          const adminUsersId = items.map(v => v.value)
          const data = { admin_users: adminUsersId }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          // const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${this.$route.params.id}/`
          const objectOldRelationAdminUsers = this.object.admin_users
          const objectNewRelationAdminUsers = objectOldRelationAdminUsers.filter(v => v !== item.value)
          const data = { system_users: objectNewRelationAdminUsers }
          return this.$axios.patch(relationUrl, data)
        }
      }
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.name'),
          value: this.object.name
        },
        {
          key: this.$t('common.createBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.dateCreated'),
          value: this.object.date_created
        },
        {
          key: this.$t('common.name'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
