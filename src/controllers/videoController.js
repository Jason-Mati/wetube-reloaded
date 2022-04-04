export const trending = (req,res) => res.render("home");

//* render 명령어를 통해 express 가 view 폴더 안의 pug 파일을 별도의 import 없이 읽을 수 있음 
//* 이대로 실행하면 에러가 뜰텐데, cwd(current working directory)가 src 폴더가 아닌 
//* package.json이 있는 폴더로 인식하기 때문임. 

export const see = (req, res) => {
    return res.send(`Watch Video #${req.params.id}`);
}
export const edit = (req,res) => {
    return res.send("Edit");
}
export const search = (req, res) => res.search("Search");
export const upload = (req, res) => res.search("Upload");
export const deleteVideo = (req, res) => {
    return res.send("Delete Video");
}





