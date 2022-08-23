<template>
  <Dialog
    v-if="iVisible"
    :title="$tc('assets.SelectPlatforms')"
    :visible.sync="iVisible"
    width="70%"
    top="1vh"
    @confirm="onConfirm"
    @cancel="onConfirm"
  >
    <div style="margin: 0 10px">
      <el-row :gutter="20">
        <el-collapse v-model="activePlatform" accordion>
          <el-collapse-item
            v-for="(ps, category) in sortedPlatforms"
            :key="category"
            :title="categoryMapper[category]"
            :name="category"
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
    }
  },
  data() {
    return {
      platforms: [],
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
      return _.groupBy(this.platforms, (item) => item.category.value)
    },
    categoryMapper() {
      const mapper = {}
      for (const p of this.platforms) {
        mapper[p.category.value] = p.category.label
      }
      return mapper
    }
  },
  mounted() {
    this.$axios.get('/api/v1/assets/platforms/').then(data => {
      this.platforms = data
    })
  },
  methods: {
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
        remote_app: 'RemoteAppCreate'
      }
      const route = mapper[platform.category] || 'HostCreate'
      this.$router.push({ name: route, query: { platform: platform.id }})
      this.iVisible = false
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

</style>
