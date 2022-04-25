import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { base } from "mongoose/lib/query";
import { token } from "morgan";
import res, { redirect } from "express/lib/response";
import req from "express/lib/request";
import { search } from "./videoController";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join " });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This password confirmation does not match",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
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
      password2,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
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
      user: { _id, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
  } = req;
  //위의 코드는 const id = req.session.user.id 와 같은 뜻임

  // 아래 코드는 변경 시도하는 username 또는 email이 기존의 다른 user의 것과 중복되지 않는지, 중복되면 에러메시지를 주는 코드 실습임
  let searchParams = [];
  if (username !== sessionUsername) {
    searchParams.push(username);
  }
  if (email !== sessionEmail) {
    searchParams.push(email);
  }

  if (searchParams.length > 0) {
    const foundUser = await User.findOne({ $or: searchParams });
    if (foundUser && foundUser.id.toString() !== _id) {
      return res.status(400).redirect("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken",
      });
    }
  }
  //d
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
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
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const see = (req, res) => res.send("See User");

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
