<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { filterClipboardOperations } from '../const'

export default {
  name: 'ClipboardAclDetail',
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/acls/clipboard-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('Clipboard'),
          value: filterClipboardOperations(this.object.operations, this)
            .map((item) => item.label)
            .join(', ')
        },
        {
          key: this.$t('Action'),
          value: this.object.action?.label || '-'
        },
        'copy_text_limit',
        'paste_text_limit',
        'download_file_size_limit',
        'upload_file_size_limit',
        'priority',
        'date_created',
        'created_by',
        'comment'
      ]
    }
  }
}
</script>
