<template>
  <Dialog
    v-if="showColumnSettingPopover"
    :title="$t('common.CustomCol')"
    :visible.sync="showColumnSettingPopover"
    :destroy-on-close="true"
    :show-cancel="false"
    width="35%"
    top="10%"
    @confirm="handleColumnConfirm()"
  >
    <el-alert type="success">
      {{ this.$t('common.TableColSettingInfo') }}
    </el-alert>
    <el-checkbox-group
      v-model="columnList"
    >
      <el-row>
        <el-col
          v-for="item in totalColumns"
          :key="item.prop"
          :span="8"
          style="margin-top:5px;"
        >
          <el-checkbox
            :label="item.prop"
            :disabled="item.prop==='id' ||item.prop==='actions' "
          >
            {{ item.label }}
          </el-checkbox>
        </el-col>
      </el-row>

    </el-checkbox-group>
  </Dialog>
</template>

<script>

import { mapGetters } from 'vuex'
import Dialog from '@/components/Dialog/index'

export default {
  name: 'ColumnSettingPopover',
  components: {
    Dialog

  },
  props: {
    totalColumns: {
      type: Array,
      default: () => []
    },
    defaultColumn: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showColumnSettingPopover: false,
      columnList: []
    }
  },
  computed: {
    ...mapGetters([
      'tableConfig'
    ])
  },
  mounted() {
    this.$eventBus.$on('showColumnSettingPopover', () => {
      this.showColumnSettingPopover = true
    })
    this.columnList = _.get(this.tableConfig, this.$route.name, this.defaultColumn || [])
  },
  methods: {
    handleColumnConfirm() {
      const ACTIVE_COLUMN_KEY = this.$route.name
      this.$store.commit('table/SET_TABLE_CONFIG',
        {
          key: ACTIVE_COLUMN_KEY,
          value: this.columnList
        }
      )
      this.showColumnSettingPopover = false
    }
  }

}
</script>

<style lang='less' scoped>

</style>
