<template>
  <div>
    <div>
      <el-button
        size="mini"
        type="primary"
        @click="onOpenDialog"
      >
        {{ $tc('View') }}
      </el-button>
    </div>
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      :visible.sync="visible"
      v-bind="$attrs"
      width="40%"
      v-on="$listeners"
    >
      <LeakPasswordList />
    </Dialog>
  </div>
</template>

<script>
import { Dialog } from '@/components'
import LeakPasswordList from '@/components/Apps/LeakPasswords/LeakPasswordList.vue'

export default {
  componentName: 'LeakPasswords',
  components: {
    LeakPasswordList,
    Dialog
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: function() {
        return this.$t('LeakPasswordList')
      }
    },
    url: {
      type: String,
      default: `/api/v1/settings/leak-passwords/`
    }
  },
  data() {
    return {
      visible: false,
      form: this.value,
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        fields: [],
        fieldsMeta: {}
      }
    }
  },

  methods: {
    onOpenDialog() {
      this.visible = true
    }
  }
}
</script>

<style scoped>
</style>
