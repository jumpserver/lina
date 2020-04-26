<template>
  <GenericDetailPage :object.sync="assetPermissionData" v-bind="config" @tab-click="TabClick">
    <template #detail>
      <div>
        <el-row :gutter="20">
          <el-col :md="14" :sm="24">
            <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
          </el-col>
          <el-col :md="10" :sm="24">
            <ActiveCard v-bind="activeConfig" />
          </el-col>
        </el-row>
      </div>
    </template>
    <template #userAndUserGroups>
      <div>
        <AssetPermissionUser />
      </div>
    </template>
    <template #assetAndNode>
      <div>
        <AssetPermissionAsset />
      </div>
    </template>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { DetailCard, ActiveCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'
import AssetPermissionUser from './AssetPermissionUser'
import AssetPermissionAsset from './AssetPermissionAsset'

export default {
  name: 'AssetPermissionDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    ActiveCard,
    AssetPermissionUser,
    AssetPermissionAsset
  },
  data() {
    return {
      flag: false,
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('perms.AssetPermissionDetail'),
            name: 'detail'
          },
          {
            title: this.$t('perms.UsersAndUserGroups'),
            name: 'userAndUserGroups'
          },
          {
            title: this.$t('perms.AssetAndNode'),
            name: 'assetAndNode'
          }
        ]
      },
      activeConfig: {
        icon: 'fa-info',
        title: this.$t('perms.QuickModify'),
        content: [
          {
            name: this.$t('perms.Active'),
            is_active: true
          }
        ],
        url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/`
      },
      assetPermissionData: {}
    }
  },
  computed: {
    cardTitle() {
      return this.assetPermissionData.id
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.assetPermissionData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.getDataLength(this.assetPermissionData.users)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.getDataLength(this.assetPermissionData.user_groups)
        },
        {
          key: this.$t('perms.AssetCount'),
          value: this.getDataLength(this.assetPermissionData.assets)
        },
        {
          key: this.$t('perms.NodeCount'),
          value: this.getDataLength(this.assetPermissionData.nodes)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.getDataLength(this.assetPermissionData.system_users)
        },
        {
          key: this.$t('perms.DateStart'),
          value: toSafeLocalDateStr(this.assetPermissionData.date_start)
        },
        {
          key: this.$t('perms.DateExpired'),
          value: toSafeLocalDateStr(this.assetPermissionData.date_expired)
        },
        {
          key: this.$t('perms.DateCreated'),
          value: '没有这个字段'
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: '没有这个字段'
        },
        {
          key: this.$t('common.Comment'),
          value: this.assetPermissionData.comment
        }
      ]
    }
  },
  watch: {
    assetPermissionData: function(newAssetPermissionData, oldAssetPermissionData) {
      this.activeConfig.content[0].is_active = newAssetPermissionData.is_active
      this.flag = true
    }
  },
  methods: {
    getDataLength(data) {
      if (data instanceof Array) {
        return data.length
      }
      return data
    },
    TabClick(tab) {
      if (tab.name !== 'detail') {
        this.$set(this.config, 'hasRightSide', false)
      } else {
        this.$set(this.config, 'hasRightSide', true)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
