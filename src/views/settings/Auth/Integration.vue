<template>
  <div class="auth-container">
    <IBox :title="$tc('AuthIntegration')" class="auth-box-wrapper auth-method-box">
      <el-row v-for="[type, items] in Object.entries(groupedAuthItems)" :key="type" :gutter="20">
        <h4 class="auth-method-type">{{ typeMap[type] }}</h4>
        <AuthMethod
          v-for="item in items"
          :key="item.title"
          v-bind="item"
        />
      </el-row>
    </IBox>
  </div>
</template>

<script>
import AuthMethod from './components/AuthMethod.vue'
import IBox from '@/components/Common/IBox'
import { getAuthItems } from './const'
import { mapState } from 'vuex'

export default {
  components: {
    IBox,
    AuthMethod
  },
  data() {
    return {
      groupedAuthItems: {},
      typeMap: {
        common: this.$t('Common'),
        SSO: this.$t('SSO'),
        IdP: this.$t('IdP')
      }
    }
  },
  computed: {
    ...mapState({
      authMethodsSetting: state => state.settings.authMethods
    }),
    // 未启用的认证方法（按类型分组）
    disabledAuthItems() {
      const disabled = {}
      Object.entries(this.authItems).forEach(([type, items]) => {
        const disabledItems = items.filter(item => !item.enabled)
        if (disabledItems.length > 0) {
          disabled[type] = disabledItems
        }
      })
      return disabled
    },
    // 已开启的认证方法（平铺列表，不分类）
    enabledAuthMethodsList() {
      const enabled = []
      Object.values(this.authItems).forEach(items => {
        items.forEach(item => {
          if (item.enabled) {
            enabled.push(item)
          }
        })
      })
      return enabled
    },
    // 是否有未启用的认证方法
    hasDisabledMethods() {
      return Object.values(this.disabledAuthItems).some(items => items.length > 0)
    },
    // 是否有已开启的认证方法
    hasEnabledMethods() {
      return this.enabledAuthMethodsList.length > 0
    }
  },
  async mounted() {
    await this.$store.dispatch('settings/getAuthMethods')
    await this.initAuthItems()
  },
  methods: {
    async initAuthItems() {
      let authItems = await getAuthItems(this)
      authItems = authItems.map(item => {
        return {
          ...item,
          enabled: this.authMethodsSetting[item.authKey]
        }
      })
      authItems = authItems.sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1
        }
        return a.title.localeCompare(b.title)
      })

      const groupedAuthItems = authItems.reduce((acc, item) => {
        acc[item.type] = acc[item.type] || []
        acc[item.type].push(item)
        return acc
      }, {})
      this.groupedAuthItems = {}
      for (const type in this.typeMap) {
        this.groupedAuthItems[type] = groupedAuthItems[type] || []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-method-box {
  ::v-deep {
    .el-card__body {
      padding-top: 10px;
      padding-left: 30px;
      padding-right: 30px;
    }
  }
}

.auth-layout {
  min-height: 400px;
}

.auth-column {
  border-right: 1px solid #e6e6e6;
  padding-right: 20px;

  &:last-child {
    border-right: none;
    padding-right: 0;
    padding-left: 20px;
  }
}

.column-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.auth-methods-list {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.auth-method-item {
  margin-bottom: 10px;

  ::v-deep .auth-item-col {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
  }
}

h4.auth-method-type {
  margin-bottom: 8px;
  margin-top: 15px;
  padding-left: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  border-left: 3px solid #148f76;
  padding-left: 12px;
}

.no-enabled-methods,
.no-disabled-methods {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #999;
}

.auth-container {
  width: 100%;

  .auth-box-wrapper {
    margin-bottom: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .auth-layout {
    .auth-column {
      border-right: none;
      border-bottom: 1px solid #e6e6e6;
      padding-right: 0;
      padding-left: 0;
      padding-bottom: 20px;
      margin-bottom: 20px;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
    }
  }
}
</style>
