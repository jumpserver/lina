<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="instance"
    class="clipboard-acl-detail"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="instance" object-app-model="acls.ClipboardACL" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import AssetJsonTab from '@/components/Apps/ManyJsonTabs/AssetJsonTab.vue'
import UserJsonTab from '@/components/Apps/ManyJsonTabs/UserJsonTab.vue'
import { GenericDetailPage } from '@/layout/components'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    Detail,
    UserJsonTab,
    AssetJsonTab
  },
  data() {
    return {
      instance: {},
      config: {
        url: `/api/v1/acls/clipboard-acls/`,
        activeMenu: 'Detail',
        actions: {
          canUpdate: () => this.$hasPerm('acls.change_clipboardacl') || this.$t('NoPermission'),
          canDelete: () => this.$hasPerm('acls.delete_clipboardacl') || this.$t('NoPermission')
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('MenuUsers'),
            name: 'UserJsonTab'
          },
          {
            title: this.$t('AssetManagement'),
            name: 'AssetJsonTab'
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.clipboard-acl-detail :deep(.action-item.el-button--danger.is-plain.is-disabled) {
  color: var(--el-button-disabled-text-color);
}
</style>
