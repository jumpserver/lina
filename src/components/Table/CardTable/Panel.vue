<template>
  <div @click="handleClick">
    <span v-if="d.edition === 'enterprise'" class="enterprise">
      {{ $t('Enterprise') }}
    </span>
    <el-row class="panel">
      <el-col v-if="d.icon" :span="d.icon ? 8 : 0" class="image">
        <img
          v-if="d.icon.startsWith('/') || d.icon.startsWith('data:')"
          :alt="d.display_name"
          :src="d.icon"
        >
        <Icon v-else :icon="d.icon" />
      </el-col>
      <el-col :span="d.icon ? 16 : 24" class="text-zone">
        <div class="one-line">
          <b>{{ d.display_name }}</b>
        </div>
        <div class="tag-zone">
          <el-tag v-if="d.version" size="mini" style="margin-left: 5px; background-color: #ecf5ff; color: #409eff;">
            {{ d.version }}
          </el-tag>
          <el-tag v-for="tag of d.tags" :key="tag" size="mini">
            {{ capitalize(tag) }}
          </el-tag>
        </div>
        <div :title="d.comment " class="comment">
          {{ d.comment }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="jsx">
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
    return {}
  },
  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    handleClick() {
      this.$emit('onClick', this.d)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel {
  display: flex;
  flex-wrap: nowrap;
  margin-top: 0;
  height: 100%;

  .image {
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    svg {
      width: 40px;
      height: 40px;
    }
  }

  .text-zone {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .one-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;

      b {
        padding-right: 5px;
      }

      span {
        margin-left: 0 !important;
      }
    }

    .comment {
      display: -webkit-box;
      margin-top: 10px;
      font-size: 12px;
      cursor: pointer;
      overflow: hidden;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
    }

    .tag-zone {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-top: 10px;
      margin-left: -5px;
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
}

.tag-zone {
  margin-top: 10px;

  .el-tag {
    margin-right: 3px;
  }
}

.text-zone {
  text-align: left;
  height: 100%;
}
</style>
