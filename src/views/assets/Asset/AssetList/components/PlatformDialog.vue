<template>
  <el-drawer
    v-if="iVisible"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('SelectPlatform')"
    :visible.sync="iVisible"
    size="600px"
    top="1vh"
  >
    <div v-loading="loading" class="platform-content">
      <el-row :gutter="20">
        <el-collapse v-model="activeType" accordion>
          <el-collapse-item
            v-for="(ps, cName) in iPlatforms"
            :key="cName"
            :name="cName"
            :title="cName"
          >
            <el-col
              v-for="(platform, index) of ps"
              :key="platform.id"
              :span="8"
            >
              <el-tooltip :content="platform.name">
                <el-card
                  :style="{ borderLeftColor: randomBorderColor(index) }"
                  class="platform-item"
                  shadow="hover"
                  @click.native="createAsset(platform)"
                >
                  <div class="icon-zone">
                    <img :src="getPlatformLogo(platform)" alt="icon" class="asset-icon">
                  </div>
                  <span class="platform-name">{{ platform.name }}</span>
                </el-card>
              </el-tooltip>
            </el-col>
          </el-collapse-item>
        </el-collapse>
      </el-row>
    </div>
  </el-drawer>
</template>
<script>
import { loadPlatformIcon } from '@/utils/jms'

export default {
  name: 'PlatformDrawer',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      platforms: [],
      recentPlatformIds: [],
      loading: true,
      activeType: 'host',
      recentUsedLabel: this.$t('RecentlyUsed'),
      typeIconMapper: {
        linux: 'fa-linux',
        windows: 'fa-windows',
        unix: '',
        macos: 'fa-apple'
      },
      bottomColors: [
        '#1c84c6', '#23c6c8', '#1ab394', '#f8ac59',
        '#783887', '#fc6554'
      ],
      allRecentPlatforms: []
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    },
    iPlatforms() {
      let recentPlatforms = {}
      let platforms = {}
      if (this.category === 'all') {
        recentPlatforms[this.recentUsedLabel] = this.allRecentPlatforms
        platforms = this.allSortedPlatforms
      } else {
        recentPlatforms[this.recentUsedLabel] = this.typeRecentPlatforms
        platforms = this.typeSortedPlatforms
      }
      // 最近使用为空就不用了
      if (recentPlatforms[this.recentUsedLabel].length === 0) {
        recentPlatforms = {}
      }
      return { ...recentPlatforms, ...platforms }
    },
    allSortedPlatforms() {
      return _.groupBy(this.platforms, (item) => item.category.label)
    },
    typeSortedPlatforms() {
      const typedPlatforms = this.platforms.filter(item => item.category.value === this.category)
      return _.groupBy(typedPlatforms, (item) => item.type.label)
    },
    typeRecentPlatforms() {
      return this.allRecentPlatforms.filter(item => item.category.value === this.category)
    }
  },
  async created() {
    this.platforms = await this.$store.dispatch('assets/getPlatforms')
    this.allRecentPlatforms = await this.$store.dispatch('assets/getRecentPlatforms')
    if (this.allRecentPlatforms.length > 0) {
      this.activeType = this.recentUsedLabel
    }
    this.loading = false
  },
  methods: {
    createAsset(platform) {
      this.$emit('select-platform', platform)
    },
    getPlatformLogo(platform) {
      return loadPlatformIcon(platform.name, platform.type)
    },
    onConfirm() {
      this.iVisible = false
    },
    randomBorderColor(i) {
      const length = this.bottomColors.length
      const colorIndex = i % length
      const color = this.bottomColors[colorIndex]
      return color
    },
    addToRecentPlatforms(platform) {
      const recentPlatformIds = this.recentPlatformIds.filter(i => i !== platform.id)
      recentPlatformIds.unshift(platform.id)
      if (recentPlatformIds.length > 8) {
        recentPlatformIds.pop()
      }
      this.recentPlatformIds = recentPlatformIds
      localStorage.setItem('RecentPlatforms', JSON.stringify(recentPlatformIds))
    },
    handleSelect(platform) {
      this.addToRecentPlatforms(platform)
      this.$emit('select-platform', platform)
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep .el-drawer__body {
  padding: 0 20px;
}

.platform-content {
  padding: 0 10px;
}

.platform-item {
  margin: 5px 0;

  & ::v-deep .el-card__body {
    padding: 10px;
    flex-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  border-left: solid 4px;
}

.platform-item:hover {
  cursor: pointer;
}

.recent {
  font-weight: 500;
  color: #303133;
}

::v-deep .el-collapse {
  border: none;

  .el-collapse-item:last-child {
    .el-collapse-item__header {
      border: none;
    }

    .el-collapse-item__wrap {
      border-bottom: none;
    }
  }
}

::v-deep .el-card__body {
  display: flex;
  align-items: center;
}

.icon-zone {
  width: 2em;
}

.asset-icon {
  height: 2em;
  vertical-align: -0.2em;
  width: 26px;
  fill: currentColor;
}

.platform-name {
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
