import User from "../models/User";
import bcrypt from "bcrypt";

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
  const user = User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exist",
    });
  }
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

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");
