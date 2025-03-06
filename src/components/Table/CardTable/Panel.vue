<template>
  <div>
    <span v-if="d.edition === 'enterprise'" class="enterprise">
      {{ $t('Enterprise') }}
    </span>
    <el-row class="panel">
      <el-col v-if="d.icon" :span="8" class="image">
        <img
          v-if="d.icon.startsWith('/') || d.icon.startsWith('data:')"
          :alt="d.display_name"
          :src="d.icon"
        >
        <Icon v-else :icon="d.icon" />
      </el-col>
      <el-col :span="16" class="text-zone">
        <div class="one-line">
          <b>{{ d.display_name }}</b>
          <el-tag v-if="d.version" size="mini" style="margin-left: 5px">
            {{ d.version }}
          </el-tag>
        </div>
        <div :title="d.comment " class="comment">
          {{ d.comment }}
        </div>
        <div class="tag-zone">
          <el-tag v-for="tag of d.tags" :key="tag" size="mini">
            {{ capitalize(tag) }}
          </el-tag>
        </div>
      </el-col>
    </el-row>
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
    return {}
  },
  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
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
      height: 120px;
      font-size: 12px;
      padding: 10px 0;
      cursor: pointer;
      overflow: hidden;
      -webkit-line-clamp: 4;
      -webkit-box-flex: 1;
      -webkit-box-orient: vertical;
      text-align: left;
    }

    .tag-zone {
      display: flex;
      height: 30%;
      align-items: center;
      cursor: pointer;
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
