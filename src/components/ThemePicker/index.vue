<template>
  <div class="theme">
    <el-button
      type="primary"
      size="mini"
      @click="onChange"
    >
      {{ $t('setting.Setting') }}
    </el-button>
    <Dialog
      :title="$t('xpack.ModifyTheme')"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'30%'"
      :visible.sync="visible"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <div>
        <div>
          <span>{{ $t('notifications.Subject') }}：</span>
          <el-select
            v-model="themeColor"
            @change="handleChangeColor"
          >
            <el-option
              v-for="item in getThemeOptions"
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
import { defaultThemeColor } from '@/utils/theme/color'
import themeOptions from '@/utils/theme/themeOptions.js'

export default {
  name: 'ThemePicker',
  components: {
    Dialog
  },
  props: {
    themes: {
      type: Array,
      default: () => ['#1ab394', '#ca2e1f', '#1c84c6', '#23c6c8', '#f8ac59', '#ed5565']
    },
    value: {
      type: String,
      default: defaultThemeColor
    }
  },
  data() {
    return {
      visible: false,
      themeColor: this.$store.state.settings.themeColor
    }
  },
  computed: {
    getThemeOptions() {
      const options = []
      for (const [key] of Object.entries(themeOptions)) {
        if (this.themes.includes(key)) {
          options.push({
            value: key,
            label: this.matchLabel(key)
          })
        }
      }
      return options
    }
  },
  methods: {
    matchLabel(key) {
      if (key === '#1ab394') {
        return this.$t('xpack.ClassicGreen')
      } else if (key === '#ca2e1f') {
        return this.$t('xpack.ChinaRed')
      } else {
        return key
      }
    },
    handleChangeColor(val) {
      this.$emit('change', val)
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
  .theme {
    &>>> .el-input__suffix {
      line-height: 34px;
    }
    &>>> .el-dialog__body {
      padding: 0 20px;
      overflow: hidden;
    }
  }
</style>
