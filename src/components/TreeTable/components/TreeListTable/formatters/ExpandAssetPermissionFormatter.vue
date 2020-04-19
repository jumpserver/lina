<template>
  <div style="border: none; background: none;">
    <span v-show="row.users.length"><label>{{ this.$t('perms.User') }}:</label>{{ format(row.users) }}<br></span>
    <span v-show="row.user_groups.length"><label>{{ this.$t('perms.UserGroups') }}:</label>{{ format(row.user_groups) }}<br></span>
    <span v-show="row.assets.length"><label>{{ this.$t('perms.Asset') }}:</label>{{ format(row.assets) }}<br></span>
    <span v-show="row.nodes.length"><label>{{ this.$t('perms.Node') }}</label>:{{ format(row.nodes) }}<br></span>
    <span v-show="row.system_users.length"><label>{{ this.$t('perms.SystemUser') }}:</label>{{ format(row.system_users) }}<br></span>
    <span v-show="row.actions.length"><label>{{ this.$t('perms.Actions') }}:</label>{{ format(row.actions) }}</span>
  </div>
</template>

<script>
import BaseFormatter from '@/components/ListTable/formatters/base'

export default {
  name: 'ExpandAssetPermissionFormatter',
  extends: BaseFormatter,
  methods: {
    format(val) {
      if (val instanceof Array) {
        return val.join(',')
      }
      return val
    }
  }

}
</script>

<style scoped>
  label {
    display: inline-block;
    max-width: 100%;
    margin: 5px;
    font-weight: 700;
  }
</style>
