<template>
  <div>
    <el-button type="primary" size="mini" @click="onChange">切换主题</el-button>
    <Dialog
      :title="'主题配置'"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'20%'"
      :visible.sync="visible"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <div>
        <div>
          <span>主题：</span>
          <el-select
            v-model="themeColor"
            placeholder="请选择"
            @change="handleChangeColor"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  name: 'ThemePicker',
  components: {
    Dialog
  },
  data() {
    return {
      visible: false,
      themeColor: this.$store.state.settings.themeColor,
      options: [
        {
          value: '#1ab394',
          label: '经典绿'
        }, {
          value: '#ca2e1f',
          label: '中国红'
        }]
    }
  },
  methods: {
    handleChangeColor(val) {
      this.$store.commit('settings/setTheme', val)
      this.$store.dispatch('settings/changeThemeStyle')
    },
    onChange() {
      this.visible = true
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
