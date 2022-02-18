<template>
  <div>
    <el-button v-if="!value" type="default" size="mini" @click="visible=true">{{ $t('setting.Enable') }}</el-button>
    <el-button v-else type="primary" size="mini" @click="visible=true">{{ $t('setting.Setting') }}</el-button>
    <Dialog
      v-if="visible"
      :visible.sync="visible"
      :title="title"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
      v-on="$listeners"
    >
      <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
export default {
  name: 'Announcement',
  components: {
    Dialog, GenericCreateUpdateForm
  },
  props: {
    value: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      title: this.$t('common.Announcement'),
      visible: false,
      enableField: 'ANNOUNCEMENT_ENABLED',
      config: {
        fields: [
          ['', ['ANNOUNCEMENT_ENABLED', 'ANNOUNCEMENT']]
        ],
        fieldsMeta: {
          ANNOUNCEMENT: {
            fields: [
              'SUBJECT', 'CONTENT', 'LINK'
            ],
            fieldsMeta: {
              CONTENT: {
                el: {
                  rows: 5
                }
              }
            }
          }
        },
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
        url: '/api/v1/settings/setting/?category=basic',
        hasReset: false,
        submitMethod() {
          return 'patch'
        }
      }
    }
  },
  methods: {
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
