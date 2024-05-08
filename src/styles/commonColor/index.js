const commonColor = {
  '--el-text-color': '#292827',
  '--el-icon-color': '#646A73',
  '--el-input-border-color': '#BBBFC4',
  '--el-disabled-background-color': '#dcdee2',
  '--el-form-tip-text-color': '#8F959E'
}

export const useCommonColor = () => {
  for (const [key, value] of Object.entries(commonColor)) {
    document.documentElement.style.setProperty(key, value)
  }
}
