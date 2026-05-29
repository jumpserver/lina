const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {
  assetsDir,
  createHtmlDirectiveTransform,
  createStyleLoaders,
  makeEnvDefinitions,
  outputDir,
  resolvePath
} = require('./webpack.parts')

const appName = ''

function createCommonConfig({ appEnv, isDevelopment, publicPath }) {
  const styleLoaders = (preProcessor, options) => createStyleLoaders(isDevelopment, preProcessor, options)

  return {
    context: __dirname,
    entry: {
      app: resolvePath('src/main.js')
    },
    output: {
      path: resolvePath(outputDir),
      publicPath,
      filename: `${assetsDir}/js/[name].[contenthash:8].js`,
      chunkFilename: `${assetsDir}/js/[name].[contenthash:8].js`,
      assetModuleFilename: `${assetsDir}/[name].[contenthash:8][ext][query]`,
      clean: true
    },
    ignoreWarnings: [/::v-deep usage as a combinator has been deprecated/],
    resolve: {
      alias: {
        '@': resolvePath('src'),
        vue$: '@vue/compat',
        'svg-baker-runtime': resolvePath('node_modules/svg-baker-runtime'),
        'svg-sprite-loader': resolvePath('node_modules/svg-sprite-loader'),
        'vue-loader': resolvePath('node_modules/vue-loader'),
        'markdown-it/lib/token$': require.resolve('markdown-it/lib/token.mjs')
      },
      fallback: {
        path: require.resolve('path-browserify')
      },
      extensions: ['.vue', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            hotReload: isDevelopment,
            compilerOptions: {
              preserveWhitespace: true,
              compatConfig: {
                MODE: 2
              },
              directiveTransforms: {
                html: createHtmlDirectiveTransform()
              }
            }
          }
        },
        {
          test: /\.m?jsx?$/,
          resolve: {
            fullySpecified: false
          },
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: styleLoaders(null, {
                esModule: true,
                modules: {
                  namedExport: false,
                  exportLocalsConvention: 'as-is',
                  localIdentName: isDevelopment ? '[name]__[local]' : '[hash:base64:8]'
                }
              })
            },
            {
              use: styleLoaders()
            }
          ]
        },
        {
          test: /\.s[ac]ss$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: styleLoaders('sass-loader', {
                esModule: true,
                modules: {
                  namedExport: false,
                  exportLocalsConvention: 'as-is',
                  localIdentName: isDevelopment ? '[name]__[local]' : '[hash:base64:8]'
                }
              })
            },
            {
              include: [resolvePath('src/styles/variables.scss')],
              use: styleLoaders('sass-loader', {
                esModule: true,
                modules: {
                  namedExport: false,
                  exportLocalsConvention: 'as-is',
                  mode: 'icss'
                }
              })
            },
            {
              use: styleLoaders('sass-loader')
            }
          ]
        },
        {
          test: /\.svg$/,
          include: [resolvePath('src/icons')],
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false
          },
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                symbolId: 'icon-[name]',
                spriteModule: require.resolve('svg-sprite-loader/runtime/browser-sprite.build'),
                symbolModule: require.resolve('svg-baker-runtime/browser-symbol')
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          exclude: [resolvePath('src/icons')],
          type: 'asset/resource',
          generator: {
            filename: `${assetsDir}/img/[name].[contenthash:8][ext][query]`
          }
        },
        {
          test: /\.(png|jpe?g|gif|webp|avif|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: `${assetsDir}/img/[name].[contenthash:8][ext][query]`
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: `${assetsDir}/fonts/[name].[contenthash:8][ext][query]`
          }
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: resolvePath('public/index.html'),
        filename: 'index.html',
        inject: 'body',
        scriptLoading: 'defer',
        minify: isDevelopment
          ? false
          : {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            collapseBooleanAttributes: true,
            removeScriptTypeAttributes: true
          },
        templateParameters: {
          webpackConfig: {
            name: appName
          },
          BASE_URL: publicPath
        }
      }),
      new webpack.DefinePlugin({
        ...makeEnvDefinitions(appEnv),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolvePath('public'),
            to: resolvePath(outputDir),
            globOptions: {
              ignore: ['**/index.html', '**/.DS_Store']
            },
            noErrorOnMissing: true
          }
        ]
      })
    ],
    performance: false
  }
}

module.exports = createCommonConfig
