<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="adminRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="userRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

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
      userRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.User'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.users,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectRelationUsers = this.object.users
          items.map(v => objectRelationUsers.push(v.value))
          const data = { users: objectRelationUsers }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectOldRelationUsers = this.object.users
          const objectNewRelationUsers = objectOldRelationUsers.filter(v => v !== item.value)
          const data = { users: objectNewRelationUsers }
          return this.$axios.patch(relationUrl, data)
        }
      },
      adminRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.Admin'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.admins,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectRelationAdmin = this.object.admins
          items.map(v => objectRelationAdmin.push(v.value))
          const data = { admins: objectRelationAdmin }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectOldRelationAdmin = this.object.admins
          const objectNewRelationAdmin = objectOldRelationAdmin.filter(v => v !== item.value)
          const data = { admins: objectNewRelationAdmin }
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
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('common.createBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
