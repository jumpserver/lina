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
      <el-row v-if="showRecentPlatforms.length > 0" :gutter="20">
        <p class="recent">{{ this.$t('assets.RecentlyUsed') }}</p>
        <el-col
          v-for="(item, index) of showRecentPlatforms"
          :key="item.id"
          :span="6"
        >
          <el-card
            :style="{ borderLeftColor: randomBorderColor(index) }"
            class="platform-item"
            shadow="hover"
            @click.native="createAsset(p)"
          >
            {{ item.name }}
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-collapse v-model="activePlatform" accordion>
          <el-collapse-item
            v-for="(ps, categoryName) in sortedPlatforms"
            :key="categoryName"
            :title="categoryMapper[categoryName]"
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
      recentPlatforms: {},
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
      const filterPlatforms = _.groupBy(platforms, (item) => item.category.value)
      return category === 'all' ? filterPlatforms : this.arrangePlatforms(filterPlatforms[category])
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
    },
    showRecentPlatforms() {
      return this.category === 'all' ? this.allRecentPlatforms() : this.recentPlatforms[this.category]
    }
  },
  created() {
    this.$axios.get('/api/v1/assets/platforms/').then(data => {
      this.platforms = data
    })
    this.getRecentPlatforms()
  },
  methods: {
    getRecentPlatforms() {
      const recentPlatforms = JSON.parse(localStorage.getItem('RecentPlatforms')) || {
        host: [],
        networking: [],
        database: [],
        cloud: [],
        web: []
      }
      this.recentPlatforms = recentPlatforms
    },
    setRecentPlatforms(platform) {
      const platforms = { ...this.recentPlatforms }
      const categoryValue = platform.category.value
      const platformCategory = platforms[categoryValue]
      const item = {
        id: platform.id,
        name: platform.name,
        category: platform.category
      }

      if (!_.some(platformCategory, item)) {
        if (platformCategory.length >= 4) {
          platformCategory.pop()
        }
        platformCategory.unshift(item)
        localStorage.setItem('RecentPlatforms', JSON.stringify(platforms))
      }
    },
    allRecentPlatforms() {
      const { recentPlatforms } = this
      const platforms = []
      for (const category in recentPlatforms) {
        const platformCategory = recentPlatforms[category]
        if (platformCategory.length > 0) {
          platforms.push(platformCategory[0])
        }
      }
      return platforms
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
    },
    arrangePlatforms(data = []) {
      const filterField = {}
      data.length > 0 && data.forEach(el => {
        if (el.internal) {
          filterField[el.type.value] = [el]
        } else {
          filterField[el.type.value]?.push(el)
        }
      })

      const filterFieldKey = Object.keys(filterField)
      this.activePlatform = filterFieldKey.length > 0 ? filterFieldKey[0] : ''

      return filterField
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
