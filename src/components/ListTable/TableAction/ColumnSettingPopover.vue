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

  },
  data() {
    return {
      showColumnSettingPopover: false
    }
  },
  computed: {
    config() {
      return _.get(this.tableConfig, this.$route.name, {})
    },
    totalColumns() {
      return this.config.totalColumnsList
    },
    columnList: {
      get() {
        return this.config.currentColumns
      },
      set(value) {
        this.$store.dispatch('table/setCurrentColumns', {
          name: this.$route.name,
          currentColumns: value
        })
      }
    },
    ...mapGetters([
      'tableConfig'
    ])
  },
  mounted() {
    this.$eventBus.$on('showColumnSettingPopover', () => {
      this.showColumnSettingPopover = true
    })
  },
  methods: {
    handleColumnConfirm() {
      this.showColumnSettingPopover = false
    }
  }
}
</script>

<style lang='less' scoped>
</style>
