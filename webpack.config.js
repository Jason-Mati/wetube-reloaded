//webpack은 최신의 자바스크립트 코드를 구식의 자바스크립트로 변환시켜, 오래된 브라우저에서도 읽을 수 있도록 해줌
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  // export 가 아니라 exports 다.....
  entry: {
    // 우리가 변경하고자 하는 파일
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development",
  watch: true,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    // resolve는 폴더를 만들어주는 역할을 함
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // 모든 자바스크립트 파일을 가져와서 몇가지 변환을 하겠다는 의미임
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        // loader 들은 적혀진 반대 순서대로 작동함.
      },
    ],
  },
};
