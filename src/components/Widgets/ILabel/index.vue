<template>
  <el-tag
    v-bind="{ ...$attrs, ...el }"
    :class="{ 'no-color': !label.color }"
    :closable="closable"
    :style="getLabelStyle(label)"
    :title="getKey(label) + ': ' + getValue(label)"
    class="tag-formatter"
    disable-transitions
    effect="plain"
    size="small"
    @click="handleClick(label)"
  >
    <span class="label-content">
      <b class="label-key">{{ getKey(label) }}:</b>
      <span class="label-value">&nbsp;{{ getValue(label) }}</span>
    </span>
  </el-tag>
</template>

<script>
import { isDarkness } from '@/utils/common/color'

export default {
  name: 'Label',
  props: {
    label: {
      type: [Object, String],
      default: () => ({})
    },
    el: {
      type: Object,
      default: () => ({})
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(label) {
      this.$emit('click', label)
    },
    getKey(tag) {
      if (typeof tag === 'string') {
        return tag.split(':')[0]
      } else {
        return tag.name
      }
    },
    getValue(tag) {
      if (!tag) {
        return ''
      } else if (typeof tag === 'string') {
        return tag.split(':')?.slice(1).join(':')
      } else {
        return tag.value
      }
    },
    getLabelStyle(tag) {
      const color = typeof tag === 'object' ? tag?.color : ''
      if (!color) {
        return {}
      }
      return {
        backgroundColor: color,
        color: isDarkness(color) ? '#ffffff' : '#1f2328'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-formatter {
  box-sizing: border-box;
  max-width: 180px;
  height: 22px;
  padding: 0 8px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 0;
  border-radius: 2em;
  box-shadow:
    inset 0 0 0 1px rgb(27 31 36 / 15%),
    inset 0 1px 0 rgb(255 255 255 / 12%);
  opacity: 1;
  transition: box-shadow 0.15s ease;

  .label-content {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 0;
    line-height: 20px;
    vertical-align: middle;
  }

  .label-key,
  .label-value {
    display: inline-block;
    line-height: inherit;
    white-space: nowrap;
  }

  .label-key {
    flex: 0 0 auto;
    color: inherit;
    font-weight: 600;
  }

  .label-value {
    min-width: 0;
    overflow: hidden;
    color: inherit;
    font-weight: 500;
    text-overflow: ellipsis;
  }

  &:hover {
    box-shadow:
      inset 0 0 0 1px rgb(27 31 36 / 24%),
      inset 0 1px 0 rgb(255 255 255 / 16%),
      0 1px 2px rgb(27 31 36 / 12%);
  }

  &.no-color {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: inset 0 0 0 1px var(--el-color-primary);
  }
}
</style>
