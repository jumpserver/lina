<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import { approvalActionLabel } from '@/views/acls/approval'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'CommandFilterACLDetail',
  components: {
    AutoDetailCard,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/acls/command-filter-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('CommandGroup'),
          value: this.object.command_groups.map((item) => item.name).join(', ')
        },
        {
          key: this.$t('Action'),
          value: approvalActionLabel(this.object, this.$t)
        },
        {
          key: this.$t(this.object.workflow ? 'WFWorkflows' : 'Reviewer'),
          has: this.object.action?.value === 'review',
          value: this.object.workflow
            ? this.object.workflow_name || '-'
            : (this.object.reviewers || []).map((item) => item?.name).join(', ')
        },
        {
          key: this.$t('Reviewer'),
          has: !!this.object.workflow_requires_reviewers,
          value: (this.object.reviewers || []).map((item) => item.name).join(', ')
        },
        'priority',
        'is_active',
        'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped></style>
