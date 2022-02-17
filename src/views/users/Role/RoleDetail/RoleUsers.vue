<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { ListTable, RelationCard } from '@/components'

export default {
  components: {
    ListTable,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('common.Members'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/rbac/${this.object.scope}-role-bindings/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              role: objectId,
              scope: this.object.scope
            }
          })
          return this.$axios.post(relationUrl, data)
        }
      },
      tableConfig: {
        url: `/api/v1/rbac/${this.object.scope}-role-bindings/?role=${this.object.id}`,
        columns: ['user_display', 'actions'],
        columnsMeta: {
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.perm-tree > > > .ztree {
}

</style>
