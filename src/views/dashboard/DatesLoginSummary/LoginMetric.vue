<template>
  <ve-line :data="chartData" :settings="chartSettings" :title="title" height="350px" />
</template>

<script>
export default {
  name: 'LoginMetric',
  data: function() {
    return {
      legend: {
        y: 'bottom'
      },
      title: {
        show: false
      },
      chartSettings: {
        metrics: ['LoginCount', 'ActiveUser', 'ActiveAsset'],
        area: true,
        dimension: ['Date'],
        labelMap: {
          'LoginCount': '登录数量',
          'ActiveUser': '活跃用户',
          'ActiveAsset': '活跃资产'
        }
      },
      chartData: {
        columns: ['Date', 'LoginCount', 'ActiveUser', 'ActiveAsset'],
        rows: [
          {
            'Date': '04-19',
            'LoginCount': 20316,
            'ActiveUser': 5079,
            'ActiveAsset': 4323
          },
          {
            'Date': '04-20',
            'LoginCount': 35218,
            'ActiveUser': 8804,
            'ActiveAsset': 2079
          },
          {
            'Date': '04-21',
            'LoginCount': 12864,
            'ActiveUser': 3216,
            'ActiveAsset': 1666
          },
          {
            'Date': '04-22',
            'LoginCount': 37508,
            'ActiveUser': 9377,
            'ActiveAsset': 8837
          },
          {
            'Date': '04-23',
            'LoginCount': 11787,
            'ActiveUser': 2946,
            'ActiveAsset': 1417
          },
          {
            'Date': '04-24',
            'LoginCount': 37749,
            'ActiveUser': 9437,
            'ActiveAsset': 8567
          },
          {
            'Date': '04-25',
            'LoginCount': 28591,
            'ActiveUser': 7147,
            'ActiveAsset': 1492
          },
          {
            'Date': '04-26',
            'LoginCount': 28571,
            'ActiveUser': 7143,
            'ActiveAsset': 2969
          },
          { 'Date': '04-27', 'LoginCount': 8789, 'ActiveUser': 2197, 'ActiveAsset': 852 },
          {
            'Date': '04-28',
            'LoginCount': 11434,
            'ActiveUser': 2857,
            'ActiveAsset': 690
          },
          { 'Date': '04-29', 'LoginCount': 2100, 'ActiveUser': 525, 'ActiveAsset': 193 },
          {
            'Date': '04-30',
            'LoginCount': 35305,
            'ActiveUser': 8826,
            'ActiveAsset': 2125
          },
          {
            'Date': '05-01',
            'LoginCount': 27371,
            'ActiveUser': 6842,
            'ActiveAsset': 5670
          },
          { 'Date': '05-02', 'LoginCount': 5433, 'ActiveUser': 905, 'ActiveAsset': 127 },
          {
            'Date': '05-03',
            'LoginCount': 59824,
            'ActiveUser': 9970,
            'ActiveAsset': 9148
          },
          {
            'Date': '05-04',
            'LoginCount': 69371,
            'ActiveUser': 11562,
            'ActiveAsset': 2237
          },
          {
            'Date': '05-05',
            'LoginCount': 11388,
            'ActiveUser': 1898,
            'ActiveAsset': 1685
          },
          {
            'Date': '05-06',
            'LoginCount': 101993,
            'ActiveUser': 16999,
            'ActiveAsset': 13882
          },
          {
            'Date': '05-07',
            'LoginCount': 26256,
            'ActiveUser': 4376,
            'ActiveAsset': 829
          },
          { 'Date': '05-09', 'LoginCount': 0, 'ActiveUser': 0, 'ActiveAsset': 0 },
          { 'Date': '05-11', 'LoginCount': 0, 'ActiveUser': 0, 'ActiveAsset': 0 }]
      }
    }
  }
}
</script>
