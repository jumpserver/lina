<template>
  <div>
    <el-button type="primary" @click="onChange">点击</el-button>
    <Dialog
      :title="'主题配置'"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'40'"
      :visible.sync="visible"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <div>
        <div>
          <span>主题：</span>
          <el-color-picker
            v-model="themeColor"
            class="u-theme-picker"
            :predefine="themeList"
            @change="handleChangeColor"
          />
        </div>
        <div>
          <span>主题2：</span>
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
import { changeSidebarColor } from '@/utils/theme/sidebar-variables'

export default {
  name: 'ThemePicker2',
  components: {
    Dialog
  },
  data() {
    return {
      visible: false,
      themeColor: this.$store.state.settings.themeColor,
      themeList: [
        '#409EFF',
        '#3C6CFE',
        '#00AE8A',
        '#30BDF4',
        '#6772E5',
        '#FB6B01',
        '#353D64',
        '#7A40F2'
      ],
      options: [{
        value: '#409EFF',
        label: '天蓝色'
      }, {
        value: '#3C6CFE',
        label: '深蓝色'
      }, {
        value: '#1ab394',
        label: '经典绿'
      }, {
        value: '#30BDF4',
        label: '蓝色梦'
      }, {
        value: '#E75A4A',
        label: '中国红'
      }, {
        value: '#FB6B01',
        label: '橙色梦'
      }, {
        value: '#353D64',
        label: '蓝黑色'
      }]
    }
  },
  methods: {
    handleChangeColor(val) {
      changeSidebarColor(val)
      this.$store.commit('settings/setTheme', val)
      this.$store.dispatch('settings/changeThemeStyle')
    },
    onChange() {
      this.visible = true
    }
  }
}
</script>

<style lang="scss">
.u-theme-picker {
  vertical-align: middle;
}
</style>
