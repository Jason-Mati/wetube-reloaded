import express from "express";
import morgan from "morgan";
import { handle } from "express/lib/application";

const PORT = 4000;

const app = express();

//_ 괄호 안은 request, response 두가지 요소로 이루어짐 _//

//_ middleware는 req, res 외에 next를 가짐. next()가 오면
//_ 그 뒤의 함수를 실행해 줌. res.send()가 온다면 middleware가 아님

const logger = morgan("dev");

const globalRouter = express.Router();
const userRouter = express.Router();
const videoRouter = express.Router();

const handleHome = (req, res) => {
return res.send("I love middleware");

};

//\* 특정 URL과 연결하려면 get, 모든 URL과 연결하려면 use

app.use(logger);
app.get("/", handleHome);

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
