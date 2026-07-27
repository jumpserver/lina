<template>
  <div class="panel-wrapper" @click="handleClick">
    <span v-if="d.edition === 'enterprise'" class="enterprise">
      {{ $t('Enterprise') }}
    </span>
    <div class="panel">
      <div class="icon-zone">
        <img v-if="showImage" :alt="d.display_name" :src="d.icon" @error="onImgError" />
        <Icon v-else-if="isNamedIcon" :icon="d.icon" />
        <div v-else class="text-icon">{{ placeholderText }}</div>
      </div>
      <div class="text-zone">
        <div :title="d.display_name" class="name">
          <b>{{ d.display_name }}</b>
        </div>
        <div v-if="d.version || d.tags?.length" class="tag-zone">
          <el-tag v-if="d.version" class="version-tag" size="small">
            {{ d.version }}
          </el-tag>
          <el-tag v-for="tag of d.tags" :key="tag" size="small">
            {{ capitalize(tag) }}
          </el-tag>
        </div>
        <div v-if="d.comment" :title="d.comment" class="comment">
          {{ d.comment }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Widgets/Icon/index.vue'

export default {
  name: 'Panel',
  components: { Icon },
  props: {
    d: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imgError: false
    }
  },
  computed: {
    // icon 是图片资源（后端路径或 base64）
    isImageIcon() {
      const icon = this.d.icon
      return !!icon && (icon.startsWith('/') || icon.startsWith('data:'))
    },
    // 图片可用（未加载失败）
    showImage() {
      return this.isImageIcon && !this.imgError
    },
    // icon 是图标名（svg / fa / el-icon）
    isNamedIcon() {
      return !!this.d.icon && !this.isImageIcon
    },
    // 无图/图裂时的文字占位:取名称前两个字符
    placeholderText() {
      const name = (this.d.display_name || '').trim()
      return name.slice(0, 2) || '--'
    }
  },
  watch: {
    // 卡片实例会被复用（v-for + keep-alive），换数据时重置图片错误态
    'd.icon'() {
      this.imgError = false
    }
  },
  methods: {
    capitalize(str) {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    onImgError() {
      this.imgError = true
    },
    handleClick() {
      this.$emit('onClick', this.d)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-wrapper {
  height: 100%;
  width: 100%;
  cursor: pointer;
}

.panel {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  height: 100%;
  width: 100%;

  .icon-zone {
    flex: 0 0 80px;
    width: 80px;
    height: auto;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 60px;
      max-height: 60px;
      object-fit: contain;
    }

    // 命名图标统一尺寸
    :deep(svg) {
      width: 40px;
      height: 40px;
    }

    // 无图/图裂时的文字占位块:方形 6px 圆角,取名称前两字
    .text-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border-radius: 6px;
      background-color: var(--el-color-primary-light-9);
      color: var(--color-primary);
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
      user-select: none;
    }
  }

  .text-zone {
    flex: 1 1 auto;
    // 关键:允许子元素在 flex 布局内正常 ellipsis
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    height: 100%;
    padding: 5px 8px 0 0;
    overflow: hidden;

    .name {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      b {
        font-size: 14px;
        font-weight: 600;
      }
    }

    .tag-zone {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      margin-top: 8px;

      .version-tag {
        background-color: var(--el-color-primary-light-9);
        color: var(--color-primary);
      }
    }

    .comment {
      width: 100%;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary, #909399);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
  }
}

.enterprise {
  position: absolute;
  right: -1px;
  top: -1px;
  background-color: var(--color-primary);
  color: #fff;
  padding: 3px 8px 4px 9px;
  font-size: 13px;
  border-radius: 3px 3px 3px 8px;
  z-index: 1;
}
</style>
