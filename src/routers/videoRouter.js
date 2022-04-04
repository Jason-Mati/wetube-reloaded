import express from "express";
import { see, edit, upload, deleteVideo } from "../controllers/videoController";    

const videoRouter = express.Router();

videoRouter.get("/upload", upload);
videoRouter.get("/:id(\\d+)", see);
videoRouter.get("/:id(\\d+)/edit", edit);
videoRouter.get("/:id(\\d+)/delete", deleteVideo);

//* :id 보다 upload가 위에 있는 이유를 생각해보자. request를 위에서부터 받기 때문.  *//
//* "/:" 는 파라미터임, argument 나 variable 등 모두 들어갈 수 있음. 변수를 포함시킬 수 있게 해주는 것이 중요한 것임 *//


export default videoRouter;

