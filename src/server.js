import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();

const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
// 위의 코드로 인해 edit.pug의 form 안의 value들을 이해할 수 있도록 하고, 자바스크립트 형식으로 변형시켜줌
// 즉, form에 입력한 값을 req.body에서 불러올 수 있도록 하는 것임
app.use(express.json());
// 위의 코드로 인해 string을 받아서 JSON으로 변환해줌

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

//* 위의 session 코드는 반드시 아래 router 코드 보다 위에 있어야 함.
//* session 으로 인해 로그인한 유저가 누구인지 알고, 브라우저와 백엔드간 계속해서 연결시켜 줌.
/* secret 안의 내용은 남들이 봐서는 안되는 비밀 내용을 넣는 것임. .env 파일을 만들어 그 안에 비밀 공간을 만들어야 함.
   .env 파일안의 코드는 관습적으로 모두 대문자로 입력함
*/
app.use(flash());
app.use(localsMiddleware);
//* localsMiddleware 가 session 보다 반드시 뒤에 와야함. (???)
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use("/uploads", express.static("uploads"));
//upload 된 파일의 모든 랜덤한 주소를 express에서 인식할 수 있도록 하는 코드임
app.use("/static", express.static("assets"));
//base.pug에서 읽을 수 있게 해줘야 함 (script ....)
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);
app.use("/convert", express.static("node_modules/@ffmpeg/core/dist"));

/*
if(process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
	
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"))
	})
}
*/

export default app;
