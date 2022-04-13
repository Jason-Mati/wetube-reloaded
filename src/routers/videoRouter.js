import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id(\\d+)", watch);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);

//* :id 보다 upload가 위에 있는 이유를 생각해보자. request를 위에서부터 받기 때문.  *//
//* "/:" 는 파라미터임, argument 나 variable 등 모두 들어갈 수 있음. 변수를 포함시킬 수 있게 해주는 것이 중요한 것임 *//
//* (\\d+) 는 숫자만 들어가야 한다는 의미임
videoRouter.route("/upload").get(getUpload).post(postUpload);
export default videoRouter;
