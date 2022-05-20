const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const addComment = (text, id) => {
  const videoComments = document.querySelector("video__comments ul");
  const newComment = document.createElement("i");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment ";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  videoComments.prepend(newComment);
  //append 는 맨 뒤에 달고, prepend 는 맨 앞에 달아줌
};

const handleSubmit = async (event) => {
  event.preventDefault();
  // 브라우저가 항상 하는 일을 멈추게 하는 것 (submit하면 제출받고 새로고침 자동으로 하는 현상 등)
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //일반적인 텍스트가 아니라 JSON 텍스트라는 것을 알려주는 것임
    },
    body: JSON.stringify({ text }),
    //server.js 파일의 app.use(express.json()); 로 적은 미들웨어 덕분에 위 코드가 가능함
  });

  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
    textarea.value = "";
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
