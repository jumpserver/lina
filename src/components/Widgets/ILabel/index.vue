<template>
  <el-tag
    :class="{'no-color': !label.color}"
    :closable="closable"
    :color="label.color"
    :title="label.name + ': ' + label.value"
    class="tag-formatter"
    disable-transitions
    effect="plain"
    size="mini"
    v-bind="el"
    @click="handleClick(label)"
    v-on="$listeners"
  >
    <span :class="[getColor(label)]">
      <b> {{ getKey(label) }}:</b> {{ getValue(label) }}
    </span>
  </el-tag>
</template>

<script lang="jsx">
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
    getColor(tag) {
      if (isDarkness(tag.color)) {
        return 'white'
      } else {
        return 'black'
      }
    }
  }
}
</script>

<style scoped>
.white {
  color: white;
}

.black {
  color: black;
}

.tag-formatter {
  border: none;

  span {
    line-height: 20px;
  }

  &.no-color {
    border: solid 1px var(--color-primary);

    span.black {
      color: var(--color-primary);
    }
  }

  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
}
</style>
