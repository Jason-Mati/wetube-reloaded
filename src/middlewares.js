import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "koknitube/images",
    acl: "public-read",
  }),
});
const s3VideoUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "koknitube/videos",
    acl: "public-read",
  }),
});

//locals는 템플릿에서 사용할 수 있는 것들임.
//flash 미들웨어 설치 및 설정 후, flash 의 에러종류와 메시지를 설정했다면,
//템플릿에서 message.(에러의 종류) 코드를 통해 에러 메시지를 노출시킬 수 있음
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isHeroku = isHeroku;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Login First");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Authorized");
    //express-flash를 설치해서 사용 가능하며, 메시지의 타입과 내용을 입력해주면 됨
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 },
  storage: isHeroku ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 100000000 },
  storage: isHeroku ? s3VideoUploader : undefined,
});
// https://www.npmjs.com/package/multer 문서 참고
// edit-profile 템플릿의 enctype="multipart/form-data" 내용도 참조
// 절~~대!! 파일은 DB에 저장하면 안됨!! DB에는 파일의 주소(URL)를 남겨서 써야하는 것임.
