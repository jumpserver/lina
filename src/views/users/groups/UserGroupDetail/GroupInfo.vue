<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard } from '@/components'
export default {
  name: 'GroupInfo',
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
      relationConfig: {
        icon: 'fa-user',
        title: this.$ttc('members'),
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
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/users/users-groups-relations/?usergroup=${objectId}&user=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/users/users-groups-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              usergroup: objectId
            }
          })
          return this.$axios.post(relationUrl, data)
        }
      }
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$ttc('name'),
          value: this.object.name
        },
        {
          key: this.$ttc('createdBy'),
          value: this.object.created_by
        },
        {
          key: this.$ttc('dateCreated'),
          value: this.object.date_created
        },
        {
          key: this.$ttc('comment'),
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
