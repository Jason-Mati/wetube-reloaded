import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  //User는 여러개의 Video를 가져야 하기 때문에 array형태로 함.
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});
//패스워드를 수정한 경우에만, hash 되도록 설정한 것임.
//isModified를 쓰지 않으면, video 업로드 할때마다 user.save()가 실행되고, userSchema.pre("save")가 실행되어 hash가 중복 적용 되는 문제가 생김
const User = mongoose.model("User", userSchema);

export default User;
