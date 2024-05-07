const commonColor = {
  '--el-text-color': '#1F2329',
  '--el-icon-color': '#646A73',
  '--el-input-border-color': '#BBBFC4',
  '--el-disabled-background-color': '#EFF0F1',
  '--el-form-tip-text-color': '#8F959E'
}

export const useCommonColor = () => {
  for (const [key, value] of Object.entries(commonColor)) {
    document.documentElement.style.setProperty(key, value)
  }
}
