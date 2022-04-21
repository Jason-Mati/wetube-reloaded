import res from "express/lib/response";
import Video from "../models/Video";

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
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};
/* pageTitle 변수를 Home.pug 로 보내서 타이틀이 Home | Wetube 가 되게 해줌
render 함수는 2가지 인수를 가짐. 하나는 pug파일명("home"), 다른 하나는 '원하는만큼의 변수'를 가질 수 있는 오브젝트 임

render 명령어를 통해 express 가 view 폴더 안의 pug 파일을 별도의 import 없이 읽을 수 있음
이대로 실행하면 에러가 뜰텐데, cwd(current working directory)가 src 폴더가 아닌
package.json이 있는 폴더로 인식하기 때문임. */

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  /* 위 코드 중요. MONGOOSE SCHEMA 기능 중 findById 사용*/
  //* const id = req.params.id; 와 똑같은 코딩임 (위에 것을 ES6 라고 함)
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  {
    return res.render("watch", { pageTitle: video.title, video });
  }
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  /* await video.save();
     위 코드가 존재할 경우, video edit 할 때, 이 위쪽에서 에러가 나는데, 원인을 파악해 봐야함 */
  return res.redirect(`/videos/${id}`);
};
//* redirect를 사용하여 특정 주소로 바로 이동시킴

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      /*
      Video.js 에   
      createdAt: { type: Date, required: true, default: Date.now },
      넣어주면서 videoController.js 에서는 
      createdAt: Date.now(),
      를 넣지 않아도 되는 것임
      */
      hashtags: Video.formatHashtags(hashtags),
    });

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
  console.log(id);
  await Video.findByIdAndDelete(id);
  // delete Video
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
    });
  }

  return res.render("search", { pageTitle: "Search", videos });
};
