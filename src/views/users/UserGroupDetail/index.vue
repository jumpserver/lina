<template>
  <GenericDetailPage :object.sync="group" v-bind="config">
    <template #info>
      <div>
        <el-row :gutter="20">
          <el-col :md="14" :sm="24">
            <DetailCard :title="cardTitle" :items="detailItems" />
          </el-col>
          <el-col :md="10" :sm="24">
            <RelationCard v-bind="relationConfig" />
          </el-col>
        </el-row>
      </div>
    </template>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { DetailCard, RelationCard } from '@/components'

export default {
  components: {
    GenericDetailPage,
    DetailCard,
    RelationCard
  },
  data() {
    return {
      group: { name: '', comment: '' },
      config: {
        activeMenu: 'info',
        submenu: [
          {
            title: this.$tc('Basic Info'),
            name: 'info'
          },
          {
            title: this.$t('perms.Asset permissions'),
            name: 'assetPermissions'
          }
        ],
        actions: {
          canDelete: true,
          canUpdate: true
        }
      },
      groupMembers: [],
      relationConfig: {
        icon: 'fa-user',
        title: this.$tc('Members'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini'
        },
        hasObjectsId: ['938b47a3-db34-40be-b732-ee0125a4857c', '3e3b75a9-11fd-4b97-ad04-17a50a72507c'],
        hasObjects: [
          // {
          //   id: '1',
          //   name: '周杰伦'
          // },
          // {
          //   id: '2',
          //   name: '昆凌'
          // },
          // {
          //   id: '3',
          //   name: '周杰伦'
          // }
        ],
        loading: true
      },
      cardTitle: this.$tc('Basic Info')
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$tc('Name'),
          value: this.group.name
        },
        {
          key: this.$tc('Created by'),
          value: this.group.created_by
        },
        {
          key: this.$tc('Date Created'),
          value: this.group.date_created
        },
        {
          key: this.$tc('Comment'),
          value: this.group.comment
        }
      ]
    }
  },
  mounted() {
    // getUserGroupMembers(this.$route.params.id).then(data => {
    //   for (const i of data) {
    //     this.relationConfig.objectsId.push(i.user)
    //   }
    //   console.log(this.relationConfig.objectsId)
    // }).finally(() => {
    //   this.relationConfig.loading = false
    // })
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>

</style>
