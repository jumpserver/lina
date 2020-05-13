<template>
  <el-col :span="6">
    <IBox v-bind="$attrs" :title="title">
      <template #title>
        <h5>{{ title }}</h5>
      </template>
      <template #label>
        <span v-if="label" :class="'label label-' + label.type">{{ label.title }}</span>
      </template>
      <template v-slot:default>
        <div class="ibox-content">
          <h1 class="no-margins">
            <el-link
              v-loading="loading"
              element-loading-spinner="el-icon-loading"
              class="total-count"
              :underline="false"
              type="success"
              :href="totalCount.redirect"
            >{{ count }}
            </el-link>
          </h1>
          <small>{{ totalCount.describe }}</small>
        </div>
      </template>
    </IBox>
  </el-col>
</template>

<script>
import { IBox } from '@/components'

export default {
  name: 'SummaryCard',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default: () => null
    },
    label: {
      type: Object,
      default: () => null
    },
    totalCount: {
      type: Object,
      default() {
        return {
          url: '',
          key: '',
          describe: '',
          redirect: ''
        }
      }
    }
  },
  data() {
    return {
      count: null,
      loading: true
    }
  },
  mounted() {
    this.initCount()
  },
  methods: {
    async initCount() {
      await this.$axios.get(this.totalCount.url).then(res => {
        this.count = res[this.totalCount.key]
      }).catch(error => {
        this.$message.error(error)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
  .ibox-title h5 {
    display: inline-block;
    font-size: 14px;
    margin: 0 0 7px;
    padding: 0;
    text-overflow: ellipsis;
    float: left;
    color: #686a6c;
  }

  .no-margins {
    margin: 0 !important;
  }

 .total-count {
    color: #428bca;
    text-decoration: none;
    font-weight: 100;
    font-size: 30px;
  }

 .label-success {
   background-color: #1c84c6;
   color: #FFFFFF;
 }

 .label-info {
   background-color: #23c6c8;
   color: #FFFFFF;
 }

 .label-primary {
   background-color: #1ab394;
   color: #FFFFFF;
 }

 .label-danger {
   background-color: #ed5565;
   color: #FFFFFF;
 }

 .label {
   display: inline;
   line-height: 1;
   text-align: center;
   white-space: nowrap;
   vertical-align: baseline;
   border-radius: .25em;
   font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
   font-weight: 600;
   font-size: 10px;
   padding: 3px 8px;
   margin-left: 4px;
   text-shadow: none;
   float: right!important;
 }
</style>
