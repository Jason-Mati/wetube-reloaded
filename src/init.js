import "regenerator-runtime";

import "dotenv/config";
//* 위 코드(dotenv)는 가능한 가장 먼저 적어야 작동함. env파일과 다른 파일들간 소통하게 해주는 역할
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 2000;

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);

// Procfile의 파일명은 반드시 P가 대문자이어야 함
