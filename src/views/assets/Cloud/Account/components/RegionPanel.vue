<template>
  <div>
    <el-link
      icon="el-icon-edit"
      :underline="false"
      @click="handlerLinkClick"
    >
      {{ content }}
    </el-link>
    <Dialog
      :destroy-on-close="true"
      :title="$tc('Region')"
      :visible.sync="regionVisible"
      :show-cancel="false"
      width="60%"
      @confirm="regionVisible=false"
    >
      <el-row>
        <el-col>
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckedAllChange">
            {{ $t('All') }}
          </el-checkbox>
        </el-col>
      </el-row>
      <el-checkbox-group
        v-model="checkedRegion"
        @change="handleCheckedRegionChange"
      >
        <el-row
          v-for="r in allRegions"
          :key="r.id"
          type="flex"
        >
          <el-col>
            <el-checkbox
              :label="r.id"
              :value="r.id"
            >
              {{ r.name }}
            </el-checkbox>
          </el-col>
        </el-row>
      </el-checkbox-group>
    </Dialog>
  </div>
</template>

<script>
import { Dialog } from '@/components'
import { encryptAttrsField } from '@/views/assets/Cloud/const'

export default {
  name: 'RegionPanel',
  components: {
    Dialog
  },
  props: {
    provider: {
      type: String,
      required: true
    },
    regions: {
      type: Array,
      default: () => []
    },
    getAuthInfo: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      content: '',
      checkedRegion: [],
      allRegions: [],
      checkAll: false,
      regionVisible: false,
      isIndeterminate: true
    }
  },
  watch: {
    regions: {
      immediate: true,
      handler(newVal) {
        this.checkedRegion = newVal
        this.refreshContent()
      }
    }
  },
  mounted() {
    if (this.regions) {
      this.checkedRegion = this.regions
    }
    this.refreshContent()
  },
  methods: {
    refreshContent() {
      const count = this.checkedRegion.length || this.$t('SelectAll')
      this.content = `${this.$t('Modify')} [${count}]`
    },
    handlerLinkClick() {
      const authInfo = this.getAuthInfo()
      let method = 'get'
      let data = {}
      let url = `/api/v1/xpack/cloud/regions/?account_id=${authInfo}`
      if (typeof authInfo === 'object') {
        const attrs = JSON.parse(JSON.stringify(authInfo))
        const category = this.$route.query.category || 'host'

        method = 'post'
        url = `/api/v1/xpack/cloud/regions/?provider=${this.provider}&category=${category}`
        data = { 'attrs': encryptAttrsField(attrs) }
      }

      this.content = this.$t('Loading')

      this.$axios[method](url, data).then(resp => {
        this.allRegions = resp?.regions
        this.regionVisible = true
        this.updateCheckedStatus()
      }).catch(() => {
        this.$message.error(this.$tc('CloudRegionTip'))
      }).finally(() => {
        this.refreshContent()
      })
    },
    handleCheckedAllChange(val) {
      this.checkedRegion = val ? this.allRegions.map(region => region.id) : []
      this.isIndeterminate = false
      this.checkAll = !!val
      this.$emit('input', [])
      this.refreshContent()
    },
    handleCheckedRegionChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === 0 || checkedCount === this.allRegions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allRegions.length

      const region = this.allRegions
        .filter(item => value.includes(item.id))
        .reduce((acc, region) => {
          acc[region.id] = region.name
          return acc
        }, {})

      this.$emit('input', region)
      this.refreshContent()
    },
    updateCheckedStatus() {
      const checkedCount = this.checkedRegion.length
      this.checkAll = checkedCount === this.allRegions.length
      if (checkedCount === 0 || checkedCount === this.allRegions.length) {
        this.handleCheckedAllChange(this.allRegions)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.el-checkbox {
  margin-bottom: 10px;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;

  ::v-deep .el-col {

    .el-checkbox {
      display: flex;
      align-items: center;
      width: 250px;
      height: 25px;
    }
  }
}
</style>
