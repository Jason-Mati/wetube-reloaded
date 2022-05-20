import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      {
        name: "video",
        maxCount: 1,
      },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

//* :id 보다 upload가 위에 있는 이유를 생각해보자. request를 위에서부터 받기 때문.  *//
//* "/:" 는 파라미터임, argument 나 variable 등 모두 들어갈 수 있음. 변수를 포함시킬 수 있게 해주는 것이 중요한 것임 *//
//* (\\d+) 는 숫자만 들어가야 한다는 의미임
export default videoRouter;
