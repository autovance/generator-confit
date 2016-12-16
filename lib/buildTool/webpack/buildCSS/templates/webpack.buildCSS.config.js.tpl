/** CSS START **/
const ExtractTextPlugin = require('extract-text-webpack-plugin');
<%
if (buildCSS.autoprefixer) {

  var browserStringArray = [];

  buildBrowser.browserSupport.forEach(function(item) {
    if (resources.buildBrowser.supportedBrowsers[item]) {
      browserStringArray = browserStringArray.concat(resources.buildBrowser.supportedBrowsers[item].browserList);
    }
  });
-%>
// Pass postCSS options onto the (temporary) loaderOptions property
const autoprefixer = require('autoprefixer');
let supportedBrowsers = {
  browsers: <%- printJson(browserStringArray, 4) %>
};
config.loaderOptions.postcss = [
  autoprefixer(supportedBrowsers)
];
<%
}

var cssExtensions = '';
var cssLoaderOptions = ''

if (buildCSS.sourceFormat === 'sass') {
  cssExtensions = resources.buildCSS.sourceFormat.sass.ext.join('|');
  cssLoaderOptions = '!sass-loader?indentedSyntax=true';

} else if (buildCSS.sourceFormat === 'stylus') {
  cssExtensions = resources.buildCSS.sourceFormat.stylus.ext.join('|');
  cssLoaderOptions = '!stylus-loader';

} else {
  cssExtensions = 'css';
  cssLoaderOptions = '';
}
%>
// ExtractTextPlugin still uses the older Webpack 1 syntax. See https://github.com/webpack/extract-text-webpack-plugin/issues/275
let cssLoader = {
  test: helpers.pathRegEx(/\.(<%= cssExtensions %>)$/),
  loader: ExtractTextPlugin.extract({
    fallbackLoader: 'style-loader',
    loader: 'css-loader!postcss-loader<%- cssLoaderOptions %>',
    publicPath: '/'   // This is relative to 'extractCSSTextPlugin.filename' below.
  })
};
config.module.rules.push(cssLoader);

// For any entry-point CSS file definitions, extract them as text files as well
let extractCSSTextPlugin = new ExtractTextPlugin({
  filename: 'css/[name].[contenthash:8].css',     // This affects the cssLoader.loader.publicPath (see above)
  allChunks: true
});
config.plugins.push(extractCSSTextPlugin);
/* **/
