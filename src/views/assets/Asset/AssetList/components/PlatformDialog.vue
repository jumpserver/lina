<template>
  <Dialog
    v-if="iVisible"
    :title="$tc('assets.SelectPlatforms')"
    :visible.sync="iVisible"
    width="60%"
    top="1vh"
    @confirm="onConfirm"
    @cancel="onConfirm"
  >
    <div style="margin: 0 10px">
      <el-row :gutter="20">
        <el-collapse v-model="activePlatform" accordion>
          <el-collapse-item
            v-for="(ps, categoryName) in sortedPlatforms"
            :key="categoryName"
            :title="categoryMapper[categoryName] || $t('assets.RecentlyUsed')"
            :name="categoryName"
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
      Validator: (value) => {
        return ['all', 'host', 'networking', 'database', 'cloud', 'web'].includes(value)
      },
      default: 'all'
    }
  },
  data() {
    return {
      platforms: [],
      recentPlatforms: [],
      activePlatform: 'host',
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
    sortedPlatforms() {
      const { category, platforms } = this
      let object = {}
      let subRecentPlatforms = []
      const filterPlatforms = _.groupBy(platforms, (item) => item.category.value)
      const recentPlatforms = JSON.parse(localStorage.getItem('RecentPlatforms')) || []

      if (category === 'all') {
        subRecentPlatforms = platforms?.filter(i => (recentPlatforms.includes(i.id)))
        object = {
          ...(subRecentPlatforms?.length > 0 && { recent: subRecentPlatforms }),
          ...filterPlatforms
        }
      } else {
        const subFilterPlatforms = _.groupBy(filterPlatforms[category], (item) => item.type.value)
        subRecentPlatforms = filterPlatforms[category]?.filter(i => (recentPlatforms.includes(i.id)))
        object = {
          ...(subRecentPlatforms?.length > 0 && { recent: subRecentPlatforms }),
          ...subFilterPlatforms
        }
      }

      this.setActivePlatform(object)
      return object
    },
    categoryMapper() {
      const mapper = {}
      for (const p of this.platforms) {
        if (this.category === 'all') {
          mapper[p.category.value] = p.category.label
        } else {
          mapper[p.type.value] = p.type.label
        }
      }
      return mapper
    }
  },
  created() {
    this.$axios.get('/api/v1/assets/platforms/').then(data => {
      this.platforms = data
    })
  },
  methods: {
    setRecentPlatforms(platform) {
      const recentPlatforms = JSON.parse(localStorage.getItem('RecentPlatforms')) || []
      if (!recentPlatforms.includes(platform.id)) {
        if (recentPlatforms.length >= 12) {
          recentPlatforms.pop()
        }
        recentPlatforms.unshift(platform.id)
        localStorage.setItem('RecentPlatforms', JSON.stringify(recentPlatforms))
      }
    },
    setActivePlatform(object) {
      const objectKeys = Object.keys(object) || []
      if (objectKeys.length > 0) {
        this.activePlatform = objectKeys[0]
      }
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
    createAsset(platform) {
      const mapper = {
        host: 'HostCreate',
        database: 'DatabaseCreate',
        cloud: 'CloudCreate',
        web: 'WebCreate',
        remote_app: 'RemoteAppCreate'
      }
      const route = mapper[platform.category.value] || 'HostCreate'
      this.$router.push({ name: route, query: { platform: platform.id }})
      this.iVisible = false
      this.setRecentPlatforms(platform)
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
</style>
