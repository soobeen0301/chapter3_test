//express라는 라이브러리 가지고오기
import express from "express";
//connect 함수 가지고오기
import connect from "./schemas/index.js";

import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddlware from "./middlewares/error-handler.middlware.js";

// app생성, app에 전역 미들웨어를 등록 (use메서드를 통해)
const app = express();
//해당 서버 포트 번호는 3000번
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.(1.2는 세트)
//body파서 구현
app.use(express.json());
//extended가 true인경우 body데이터를 가져올 수 있게
app.use(express.urlencoded({ extended: true }));
//프론트엔드 파일 서빙
app.use(express.static("./assets"));

//라우터 생성
const router = express.Router();

//생성한 라우터를 전역 미들웨어로 등록
router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

// /api인 경우에만 해당하는 api로 접근 가능 / todosRouter라는 라우터를 배열로 반환
app.use("/api", [router, todosRouter]);

//에러 처리 미들웨어를 등록
app.use(errorHandlerMiddlware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
