<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { IBox } from '@/components'
import MarkDown from '@/components/Widgets/MarkDown'

export default {
  name: 'Announcement',
  components: {
    GenericCreateUpdateForm,
    IBox
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
                component: MarkDown,
                el: {
                  preview: true,
                  rows: 5
                }
              }
            }
          }
        },
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
        url: '/api/v1/settings/setting/?category=announcement',
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
