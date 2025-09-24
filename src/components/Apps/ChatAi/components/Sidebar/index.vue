<template>
  <div class="container">
    <div class="close-sidebar">
      <i v-if="hasClose" class="el-icon-download" @click="onClose" />
    </div>
    <div v-if="!expanded" class="close-sidebar">
      <i class="fa fa-expand" style="font-weight: 200" @click="$emit('expand')" />
    </div>
    <div v-if="expanded" class="close-sidebar">
      <i class="fa fa-compress" style="font-weight: 200" @click="$emit('compress')" />
    </div>
    <div class="close-sidebar">
      <i class="fa fa-arrows-alt" style="font-weight: 200" @click="openWebsite()" />
    </div>
  </div>
</template>

<script>
import { BASE_URL } from '@/utils/common/index'

export default {
  props: {
    active: {
      type: String,
      default: 'chat'
    },
    hasClose: {
      type: Boolean,
      default: true
    },
    submenu: {
      type: Array,
      default: () => []
    },
    expanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    onClose() {
      this.$emit('close')
    },
    handleExpand() {
      this.$emit('expand-full')
    },
    async openWebsite() {
      let url = `${BASE_URL}/?_=${Date.now()}`
      if (process.env.NODE_ENV !== 'production') {
        url = url.replace('9528', '5173')
      }

      const res = await this.$axios.get('/api/v1/accounts/accounts/chat/')
      const data = await this.$axios.post(
        '/api/v1/authentication/admin-connection-token/?oid=00000000-0000-0000-0000-000000000004',
        {
          asset: res?.asset.id,
          account: res?.id,
          protocol: 'chat',
          input_username: res?.username,
          input_secret: '',
          connect_method: 'web',
          connect_options: {
            charset: 'default',
            disableautohash: false,
            reusable: false,
            token_reusable: false
          }
        }
      )
      const token = data?.id
      const newUrl = new URL(url)
      newUrl.searchParams.set('token', token)
      window.open(newUrl.toString(), '_blank')
      return url
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #f0f1f5;

  .close-sidebar {
    height: 48px;
    padding: 12px 0;
    text-align: center;
    font-size: 16px;
    cursor: pointer;

    i {
      font-size: 16px;
      font-weight: 600;
      padding: 4px;
    }

    i, .svg {
      border-radius: 2px;

      &:hover {
        color: var(--color-primary);
        background: var(--menu-hover);
      }
    }
  }
}

.el-icon-download {
  transform: rotate(-90deg)
}

::v-deep .el-tabs {
  .el-tabs__item {
    padding: 0 10px;
    font-size: 14px;

    :hover {
      color: #7b8085;
    }
  }
}
</style>
