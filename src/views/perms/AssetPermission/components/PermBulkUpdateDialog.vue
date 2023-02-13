<template>
  <GenericUpdateFormDialog
    v-if="visible"
    :selected-rows="selectedRows"
    :form-setting="formSetting"
    :visible="visible"
    v-on="$listeners"
  />
</template>

<script>
import { GenericUpdateFormDialog } from '@/layout/components'
import getFields from '../fields'

export default {
  name: 'PermBulkUpdateDialog',
  components: {
    GenericUpdateFormDialog
  },
  props: {
    permType: {
      type: String,
      default: 'asset'
    },
    visible: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      formSetting: {
        url: '',
        hasSaveContinue: false,
        initial: {},
        fields: [],
        fieldsMeta: {}
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let url
      const fieldsManager = getFields.bind(this)()
      const fields = [
        'users', 'user_groups', 'accounts',
        'actions', 'is_active', 'date_start', 'date_expired'
      ]
      const fieldsMeta = {
        users: fieldsManager.users,
        user_groups: fieldsManager.user_groups,
        accounts: fieldsManager.accounts,
        date_start: fieldsManager.date_start,
        date_expired: fieldsManager.date_expired,
        is_active: fieldsManager.is_active,
        actions: {
          label: this.$t('common.Action')
        }
      }
      if (this.permType !== 'asset') {
        url = '/api/v1/perms/application-permissions/'
        fields.splice(2, 0, 'applications')
        Object.assign(fieldsMeta, { applications: fieldsManager.applications })
      } else {
        url = '/api/v1/perms/asset-permissions/'
        fields.splice(2, 0, ...['assets', 'nodes'])
        Object.assign(fieldsMeta, {
          assets: fieldsManager.assets,
          nodes: fieldsManager.nodes
        })
      }
      this.$data.formSetting.url = url
      this.$data.formSetting.fields = fields
      this.$data.formSetting.fieldsMeta = fieldsMeta
    }
  }
}
</script>

<style scoped>

</style>
