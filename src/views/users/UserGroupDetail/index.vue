<template>
  <SubMenuPage :submenu="submenu" :active-menu="activeSubMenu">
    <span slot="title">{{ $t('users.userGroup') }}: {{ group.name }}</span>
    <ActionsGroup slot="headingRightSide" :actions="pageActions"></ActionsGroup>

    <div slot="info">
      <el-row :gutter="20">
        <el-col :span="10">
          <DetailCard :title="cardTitle" :items="cardItems"></DetailCard>
        </el-col>
      </el-row>
    </div>
  </SubMenuPage>
</template>

<script>
import { getUserGroup } from '@/api/user'
import { SubMenuPage } from '@/layout/components'
import ActionsGroup from '@/components/ActionsGroup'
import DetailCard from '@/components/DetailCard'

export default {
  components: {
    SubMenuPage,
    ActionsGroup,
    DetailCard
  },
  data() {
    return {
      activeSubMenu: 'info',
      group: { name: '' },
      pageActions: [
        {
          name: 'Update',
          title: this.$tc('Update')
        }
      ],
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
