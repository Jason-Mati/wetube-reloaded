//webpack은 최신의 자바스크립트 코드를 구식의 자바스크립트로 변환시켜, 오래된 브라우저에서도 읽을 수 있도록 해줌

const path = require("path");

console.log(__dirname);

module.export = {
  entry: "./src/client/js/main.js", // 우리가 변경하고자 하는 파일
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
  },
};
