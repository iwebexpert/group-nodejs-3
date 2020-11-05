module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/assets/scss/global.scss";`,
      },
    },
  },
  configureWebpack: (config) => {
    return {
      devServer: {
        proxy: {
          '/rout': {
            target: 'http://0.0.0.0:3000',
            secure: false,
            changeOrigin: true,
          },
        },
      },
    }
  },
}
