<template>
  <BaseDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="info">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard :title="cardTitle" :items="detailItems"></DetailCard>
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-user"></i>
              <span>组下用户</span>
            </div>
            <div>
              <Select2 v-model="value" :url="url"></Select2>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </BaseDetailPage>
</template>

<script>
import { getUserGroup } from '@/api/user'
import { BaseDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard'
import Select2 from '@/components/Select2'

export default {
  components: {
    BaseDetailPage,
    DetailCard,
    Select2
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
      placeholder: '请选择',
      url: '/api/v1/users/users/',
      value: [
        {
          label: 'hello',
          value: '1a775bbf-6861-4acb-8ae4-2f684794c8cc'
        },
        {
          label: 'test',
          value: '4dccdf84-7728-4de0-a507-67c905b3091b'
        },
        {
          label: 'whold',
          value: 'c5ec4b91-1fb2-478e-89bc-5a4abc0f9c6c'
        }
      ],
      options: []
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
