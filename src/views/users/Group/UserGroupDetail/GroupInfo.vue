<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :object="object" :excludes="excludes" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import RelationCard from '@/components/RelationCard'

export default {
  name: 'GroupInfo',
  components: {
    AutoDetailCard,
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
        title: this.$t('common.Members'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
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
      },
      url: `/api/v1/users/groups/${this.object.id}`,
      excludes: ['users']
    }
  },
  computed: {
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
