import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

import { handle } from "express/lib/application";
import res from "express/lib/response";

const PORT = 4000;

const app = express();


const logger = morgan("dev");

app.set("view engine", "pug");
app.use(logger);
app.use("/",globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);


const handleListening = () => console.log(`Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);