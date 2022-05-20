import res from "express/lib/response";
import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";
import express from "express";

/* 아래는 callback 사용 예시임
export const home = (req, res) => {
  Video.find(
    ({} = (error, videos) => {
      return res.render("home", { pageTitle: "Home", videos });
    })
  );
};
*/

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
/* pageTitle 변수를 Home.pug 로 보내서 타이틀이 Home | Wetube 가 되게 해줌
render 함수는 2가지 인수를 가짐. 하나는 pug파일명("home"), 다른 하나는 '원하는만큼의 변수'를 가질 수 있는 오브젝트 임

render 명령어를 통해 express 가 view 폴더 안의 pug 파일을 별도의 import 없이 읽을 수 있음
이대로 실행하면 에러가 뜰텐데, cwd(current working directory)가 src 폴더가 아닌
package.json이 있는 폴더로 인식하기 때문임. */

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  // 위 코드 중요. MONGOOSE SCHEMA 기능 중 findById 사용*/
  // const id = req.params.id; 와 똑같은 코딩임 (위에 것을 ES6 라고 함)
  // Video.js 에서  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, 코드로 인해 populate("owner") 사용 가능
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  {
    return res.render("watch", { pageTitle: video.title, video });
  }
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

//갑자기 편집이 안되시는 분은 videoController의 postEdit에서 const video를 exists가 아닌 findById로 바꿔보세용
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  // await video.save();
  //   위 코드가 존재할 경우, video edit 할 때, 이 위쪽에서 에러가 나는데, 원인을 파악해 봐야함 */
  req.flash("success", "Changes saved");
  return res.redirect(`/videos/${id}`);
};
//* redirect를 사용하여 특정 주소로 바로 이동시킴

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  //.post(videoUpload.fields(...))에서 fields 대신 single 이 오고 하나의 file이었다면 왔다면 req.file 이어야 함
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      /*
      Video.js 에   
      createdAt: { type: Date, required: true, default: Date.now },
      넣어주면서 videoController.js 에서는 
      createdAt: Date.now(),
      를 넣지 않아도 되는 것임
      */
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      //위에서 const { path: fileUrl } = req.file; 코드로 fileUrl을 정의하고 여기에서 쓸 수 있는건 ES6(따로 공부필요) 때문에 가능한 것임.
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(_id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}$`, "i"),
      },
    }).populate("owner");
  }

  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = video.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};
// status 뒤에는 항상 render, redirect 등의 코드로 뒤의 행동을 정의하는 코드가 와야함.
// status 제공하고 바로 연결을 끝내기 위해서는 sendStatus를 써야 함

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  //위 괄호 안처럼 비디오의 id를 챙겨 넣어주는것에 유의
  video.save();
  return res.status(201).json({
    newCommentId: comment._id,
  });
};
