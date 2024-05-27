<template>
  <div>
    <el-link
      icon="el-icon-edit"
      :underline="false"
      @click="handlerLinkClick"
    >
      {{ regionText }}
    </el-link>
    <Dialog
      :title="$tc('Region')"
      :visible.sync="regionVisible"
      :show-cancel="false"
      width="'60'"
      @confirm="regionVisible=false"
    >
      <el-row :gutter="12">
        <el-col v-for="r in allRegions" :key="r.id" :span="6">
          <el-card
            shadow="hover"
            class="region-card"
            :class="regions.indexOf(r.id) !== -1 ? 'active': ''"
            :body-style="{ padding: '6px' }"
            @click.native="handlerCardClick(r.id)"
          >
            <span>{{ r.name }}</span>
          </el-card>
        </el-col>
      </el-row>
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
      regionVisible: false,
      allRegions: []
    }
  },
  computed: {
    regionText() {
      const count = this.regions.length || this.$tc('SelectAll')
      return `${this.$tc('Modify')} [${count}]`
    }
  },
  mounted() {
  },
  methods: {
    handlerLinkClick() {
      const authInfo = this.getAuthInfo()
      let method = 'get'
      let data = {}
      let url = `/api/v1/xpack/cloud/regions/?account_id=${authInfo}`
      if (typeof authInfo === 'object') {
        const attrs = JSON.parse(JSON.stringify(authInfo))
        method = 'post'
        url = `/api/v1/xpack/cloud/regions/?provider=${this.provider}`
        data = { 'attrs': encryptAttrsField(attrs) }
      }
      this.$axios[method](url, data).then(resp => {
        this.allRegions = resp?.regions
        this.regionVisible = true
      }).catch(error => {
        this.$message.error(this.$tc('CloudRegionTip' + ' ' + error))
      })
    },
    handlerCardClick(regionId) {
      const index = this.regions.indexOf(regionId)
      if (index !== -1) {
        this.regions.splice(index, 1)
      } else {
        this.regions.push(regionId)
      }
      this.$emit('input', this.regions)
    }
  }
}
</script>

<style lang='scss' scoped>
.region-card {
  font-size: 12px;
  text-align: center;
  margin-bottom: 6px;
}
.el-card.active {
  color: var(--color-primary);
  border: 1px solid;
}
</style>
