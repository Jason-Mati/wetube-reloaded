import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import Video from "../models/Video";
import { base } from "mongoose/lib/query";
import { token } from "morgan";
import res, { redirect } from "express/lib/response";
import req from "express/lib/request";
import { search } from "./videoController";
import { populate } from "mongoose/lib/utils";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  console.log(req.body);
  const pageTitle = "Join";
  if (password !== password2) {
    console.log("error password");
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This password confirmation does not match",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    console.log("error exists");
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username or email is already taken",
    });
  }

  /* status code의 종류가 궁금하면 구글링해서 찾아보면 됨. 200 은 OK라는 뜻임.
틀린 패스워드를 입력해도 브라우저는 OK로 인식하고 저장할 것인지 물어보는 것임.
400은 Bad request라는 의미이며, 이것을 브라우저에게 알려줌. 
*/

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });

    return res.redirect("/login");
  } catch (error) {
    console.log("error create");
    console.log(error);
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exist",
    });
  }

  // 위 코드는 user를 어디에 정의했는지 찾기위한 임시 코드임
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
    //* "read:user user:email" 저 사이는 꼭 공백으로 나눠야 함
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

// #7.18 ~ #7.21 강의... 복습하자...
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  //* config 에 넣을 parameters 는 "https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps" 를 참고하여 작성
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  console.log(finalUrl);
  console.log(req.body);
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(emailData);
    // email 들 중에 primary & verified 모두 true 인 이메일을 찾아야 한다.
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // set notification
      res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", {
    pageTitle: "Edit Profile",
  });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    //위의 코드는 const _id = req.session.user._id 와 같은 뜻임
    body: { name, email, username, location },
    file,
  } = req;
  //req.file 을 사용할 수 있는 것은 multer 패키지 덕분이다

  /*[예제 1] 아래 코드는 변경 시도하는 username 또는 email이 기존의 다른 user의 것과 중복되지 않는지, 중복되면 에러메시지를 주는 코드 실습예제임

  const findByUsername = await User.findOne({ username });
  const findByEmail = await User.findOne({ email });

  const exists = await User.exists({
    $or: [{ findByUsername }, { findByEmail }],
  });
  if (exists) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This username/email ia already taken",
    });
  }
*/
  // [예제 2] 아래 코드는 변경 시도하는 username 또는 email이 기존의 다른 user의 것과 중복되지 않는지, 중복되면 에러메시지를 주는 코드 실습예제임
  /*
  const findUsername = await User.findOne({ username });
  const findEmail = await User.findOne({ email });
  if (
    (findUsername !== null && findUsername._id !== _id) ||
    findEmail._id !== _id
  ) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This username/email ia already taken",
    });
  }
  */
  //위까지
  const isHeroku = process.env.NODE_ENV === "production";

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      // 프로필 수정할때 파일을 업로드 하면 file.path를 avatarUrl로 하고, 파일을 따로 업로드하지 않으면 session.user.avatarUrl 을 avatarUrl로 한다는 의미
      name,
      email,
      username,
      location,
    },
    {
      new: true,
    }
  );
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("info", "Can't change password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, confirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== confirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  if (oldPassword === newPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The old password equals new password",
    });
  }
  user.password = newPassword;
  req.session.destroy();
  req.flash("info", "Password Updated");
  return res.redirect("/login");
};

export const logout = (req, res) => {
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");
  return res.redirect("/");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }

  return res.render("users/profile", { pageTitle: user.name, user });
};

/* KAKAO LOGIN 실습 중 */
export const startKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KA_CLIENT,
    allow_signup: false,
    scope: "profile_nickname profile_image account_email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    client_id: process.env.KA_CLIENT,
    client_secret: process.env.KA_SECRET,
    response_type: code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: POST,
      headers: {
        // 아...모르겠다...
      },
    })
  ).json();
};
