import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true, maxLength: 80 },
  description: { type: String, trim: true, required: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  /* default: Date.now() 가 아니라 Date.now로 적는 것이 매우 중요
     전자처럼 적으면 function을 즉시 실행시킨다는 것인데,
     우린 그것을 원하는 것이 아님. 후자처럼 코드를 적어놓으면
     video 생성시  몽구스가  전자처럼 자동으로 바꿔줄 것임.
     즉 아무때나 바로 실행시키는 것이 아니라, 우리가 비디오를 생성할 때만 실행시켜 줌
  */
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;

/*
middleware는 반드시 model보다 앞에 나와야 함!! 매우 중요!!
*/
