<template>
  <el-col :span="8" :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="auth-item-col">
    <el-card ref="card" shadow="hover" class="auth-card">
      <div slot="header" class="auth-item-header">
        <div class="auth-item-header-left">
          <img :src="logo" alt="auth-logo" class="auth-logo">
          <div class="auth-item-header-title" :title="title">{{ title }}</div>
        </div>
        <div class="auth-item-actions">
          <el-switch
            v-model="isEnabled"
            active-color="#148f76"
            inactive-color="#e5e6e7"
            @change="onChangeStatus"
          />
        </div>
      </div>
    </el-card>
  </el-col>
</template>

<script>
export default {
  props: {
    logo: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    authKey: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cardBody: null,
      isEnabled: this.enabled
    }
  },
  watch: {
    enabled(newVal) {
      this.isEnabled = newVal
    }
  },
  mounted() {
    const card = this.$refs.card
    this.cardBody = card.$el.querySelector('.el-card__body')
    this.cardBody.style.display = 'none'
  },
  methods: {
    onChangeStatus(value) {
      this.$emit('update:enabled', value, this.authKey)
    }
  }
}
</script>

<style scoped lang="scss">
.auth-item-col {
  margin: 10px 0;
  padding: 0 10px;

  .auth-card {
    transition: all 0.3s;
    border-radius: 4px;
    overflow: hidden;

    .auth-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .auth-item-header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .auth-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .auth-item-header-title {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }
      }

      .auth-item-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    ::v-deep(.el-card__body) {
      display: none !important;
    }
  }
}
</style>
