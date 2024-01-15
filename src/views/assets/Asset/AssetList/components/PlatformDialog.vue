<template>
  <Dialog
    v-if="iVisible"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.SelectPlatforms')"
    :visible.sync="iVisible"
    top="1vh"
    width="60%"
  >
    <div style="margin: 0 10px">
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
              :span="6"
            >
              <el-card
                :style="{ borderLeftColor: randomBorderColor(index) }"
                class="platform-item"
                shadow="hover"
                @click.native="createAsset(platform)"
              >
                {{ platform.name }}
              </el-card>
            </el-col>
          </el-collapse-item>
        </el-collapse>
      </el-row>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  name: 'PlatformDialog',
  components: {
    Dialog
  },
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
      activeType: 'host',
      recentUsedLabel: this.$t('assets.RecentlyUsed'),
      typeIconMapper: {
        linux: 'fa-linux',
        windows: 'fa-windows',
        unix: '',
        macos: 'fa-apple'
      },
      bottomColors: [
        '#1c84c6', '#23c6c8', '#1ab394', '#f8ac59',
        '#783887', '#fc6554'
      ]
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
    allRecentPlatforms() {
      return this.recentPlatformIds
        .map(i => this.platforms.find(p => p.id === i))
        .filter(p => p)
    },
    typeRecentPlatforms() {
      return this.allRecentPlatforms.filter(item => item.category.value === this.category)
    }
  },
  created() {
    this.$axios.get('/api/v1/assets/platforms/').then(data => {
      this.platforms = data
      this.loadRecentPlatformIds()
      this.activeType = Object.keys(this.iPlatforms)[0]
    })
  },
  methods: {
    loadRecentPlatformIds() {
      const recentPlatformIds = JSON.parse(localStorage.getItem('RecentPlatforms')) || []
      this.recentPlatformIds = recentPlatformIds
        .map(i => this.platforms.find(p => p.id === i))
        .filter(p => p)
        .map(p => p.id)
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
    createAsset(platform) {
      const route = _.capitalize(platform.category.value) + 'Create' || 'HostCreate'
      this.addToRecentPlatforms(platform)
      this.iVisible = false
      const query = {
        node: this.$route.query?.node || this.$route.query?.node_id || '',
        platform: platform.id,
        type: platform.type.value,
        category: platform.category.value
      }

      const router = { name: route, query }
      if (this.$route.query.node_id) {
        const { href } = this.$router.resolve(router)
        window.open(href, '_blank')
      } else {
        this.$router.push(router)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.platform-item {
  margin: 5px 0;

  & >>> .el-card__body {
    padding: 10px
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
>>> .el-collapse {
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
</style>
