<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <template v-slot:info>
      <div>
        <el-row :gutter="20">
          <el-col :span="14">
            <DetailCard :title="cardTitle" :items="detailItems" />
          </el-col>
          <el-col :span="10">
            <el-card class="box-card primary">
              <div slot="header" class="clearfix">
                <i class="fa fa-user" />
                <span>组下用户</span>
              </div>
              <div>
                <Select2 v-model="select2.value" v-bind="select2" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>

  </GenericDetailPage>
</template>

<script>
import { getUserGroupDetail, getUserGroupMembers } from '@/api/user'
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard'
import Select2 from '@/components/Select2'

export default {
  components: {
    GenericDetailPage,
    DetailCard,
    Select2
  },
  data() {
    return {
      activeSubMenu: 'info',
      groupMembers: [],
      group: { name: '' },
      submenu: [
        {
          title: this.$tc('baseInfo'),
          name: 'info'
        },
        {
          title: this.$t('perms.Asset permissions'),
          name: 'assetPermissions'
        }
      ],
      cardTitle: '基本信息',
      select2: {
        url: '/api/v1/users/users/',
        initial: this.groupMembers,
        value: []
      }
    }
  },
  computed: {
    title() {
      return this.$t('users.userGroup') + ': ' + this.group.name
    },
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
    getUserGroupDetail(this.$route.params.id).then(data => {
      this.group = data
    })

    getUserGroupMembers(this.$route.params.id).then(data => {
      this.groupMembers = data.map(v => {
        const member = {}
        member.id = v.user
        member.name = v.user_display
        return member
      })
      this.select2.initial = this.groupMembers
      console.log(this.groupMembers)
    })
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>

</style>
