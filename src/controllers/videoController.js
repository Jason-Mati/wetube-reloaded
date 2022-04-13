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
  const video = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};
//* pageTitle 변수를 Home.pug 로 보내서 타이틀이 Home | Wetube 가 되게 해줌
//* render 함수는 2가지 인수를 가짐. 하나는 pug파일명("home"), 다른 하나는 '원하는만큼의 변수'를 가질 수 있는 오브젝트 임

//* render 명령어를 통해 express 가 view 폴더 안의 pug 파일을 별도의 import 없이 읽을 수 있음
//* 이대로 실행하면 에러가 뜰텐데, cwd(current working directory)가 src 폴더가 아닌
//* package.json이 있는 폴더로 인식하기 때문임.

export const watch = (req, res) => {
  const { id } = req.params;
  //* const id = req.params.id; 와 똑같은 코딩임 (위에 것을 ES6 라고 함)
  return res.render("watch", { pageTitle: `Watching : ${video.title}` });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing : ${video.title}` });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};
//* redirect를 사용하여 특정 주소로 바로 이동시킴

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    rating: 5,
    comments: 0,
    createdAt: "Just now ",
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect("/");
};
