<template>
  <BaseDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="info">
      <el-row :gutter="20">
        <el-col :span="10">
          <DetailCard :title="cardTitle" :items="cardItems"></DetailCard>
        </el-col>
      </el-row>
    </div>
  </BaseDetailPage>
</template>

<script>
import { getUserGroup } from '@/api/user'
import { BaseDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard'

export default {
  components: {
    BaseDetailPage,
    DetailCard
  },
  data() {
    return {
      activeSubMenu: 'info',
      group: { name: '' },

      submenu: [
        {
          title: this.$tc('baseInfo'),
          name: 'info'
        },
        {
          title: this.$t('users.Group members'),
          name: 'members'
        },
        {
          title: this.$t('perms.Asset permissions'),
          name: 'assetPermissions'
        }
      ],
      cardTitle: '基本信息',
      cardItems: [
        {
          key: '名称',
          value: '我是中国人的美好一天是从什么时候开始的'
        },
        {
          key: '创建者',
          value: '广宏伟'
        },
        {
          key: '创建日期',
          value: '2019年10月17日 15:54'
        },
        {
          key: '备注',
          value: '这个是滴滴'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('users.userGroup') + ': ' + this.group.name
    }
  },
  mounted() {
    this.getGroupDetail()
  },
  methods: {
    getGroupDetail() {
      getUserGroup(this.$route.params.id).then(response => {
        this.group = response
      })
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
