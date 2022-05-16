const startBtn = ducument.getElementById("startBtn");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  console.log(stream);
};
// async, await를 프런트엔드에서 쓰면 regeneratorRuntime 에러가 뜸.
// 해결방법은 그냥 regeneratorRuntime을 설치하면 됨

startBtn.addEventListner("click", handleStart);
