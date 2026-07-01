<template>
  <div class="cloud-select-wrap">
    <div class="provider-grid">
      <div v-for="p in providers" :key="p.name" class="provider-grid__item">
        <el-card
          :body-style="{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }"
          :class="selected === p.name ? 'active' : ''"
          shadow="hover"
          @dblclick="handleCardDBClick(p.name)"
          @click="handleCardClick(p.name)"
        >
          <el-image :src="p.image" fit="contain" shape="square" />
          <div class="description">{{ p.title }}</div>
        </el-card>
      </div>
    </div>
    <div class="buttons">
      <el-button size="small" @click="handleCancel">{{ $tc('Cancel') }}</el-button>
      <el-button size="small" type="primary" @click="handleNext">
        {{ $tc('Next') }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProviderPanel',
  components: {},
  props: {
    providers: {
      type: Array,
      default: () => []
    },
    selected: {
      type: String,
      default: () => ''
    },
    active: {
      type: Number,
      required: true
    }
  },
  data() {
    return {}
  },
  methods: {
    handleCardClick(platform) {
      this.$emit('update:selected', platform)
    },
    handleCardDBClick(platform) {
      this.handleCardClick(platform)
      this.handleNext()
    },
    handleNext() {
      const provider = this.providers.filter((p) => p.name === this.selected)[0]
      if (!provider) {
        this.$message.error(this.$tc('SelectProviderMsg'))
        return
      }
      this.$emit('update:active', 1)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.cloud-select-wrap {
  background: #f3f3f3;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  align-items: stretch;
  cursor: pointer;

  &__item {
    min-width: 0;
    min-width: 220px;
  }

  :deep(.el-card) {
    height: 100%;
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    min-height: 88px;
    padding: 20px 22px;
    box-sizing: border-box;
  }

  :deep(.el-card.active) {
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  :deep(.el-image) {
    overflow: unset;

    img {
      width: 40px;
      height: 40px;
    }
  }

  :deep(.description) {
    margin-left: 15px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    white-space: normal;
    color: var(--color-text-primary) !important;
  }
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
</style>
