<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="createSuccessNextRoute"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
    title="null"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getCommandGroupFormConfig } from '../components/commandGroupForm'

export default {
  name: 'CommandGroupCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const formConfig = getCommandGroupFormConfig(this)
    return {
      ...formConfig,
      url: `/api/v1/acls/command-groups/`,
      createSuccessNextRoute: { name: 'CommandFilterACLList' },
      updateSuccessNextRoute: { name: 'CommandFilterACLList' }
    }
  }
}
</script>
