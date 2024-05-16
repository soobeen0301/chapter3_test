import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/* 할일 등록 API */
router.post("/todos", async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    //1-5. 만약 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메세지를 전달
    if (!value) {
      return res
        .status(400)
        .json({ errorMassage: "해야할 일(value) 데이터가 존재하지 않습니다." });
    }

    //2. 해당하는 마지막 order 데이터를 조회
    //findOne = 1개의 데이터만 조회
    //sort = 정렬 / -붙이면 내림차순
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    //3. 만약 존재한다면 현재 해야 할 일을 +1, order 데이터가 존재하지 않다면 1로 할당
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    //4. 해야할 일 등록
    const todo = new Todo({ value, order });
    await todo.save();

    //5. 해야할 일을 클라이언트에게 반환
    return res.status(201).json({ todo });
  } catch (error) {
    //router 다음에 있는 에러 처리 미들웨어를 실행
    next(error);
  }
});

/* 해야할 일 목록 조회 API */
router.get("/todos", async (req, res, next) => {
  // 1. 해야할 일 목록 조회를 진행
  const todos = await Todo.find().sort("-order").exec();

  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환
  return res.status(200).json({ todos });
});

/* 해야할 일 순서 변경 , 완료 / 해제, 내용 변경 API */
router.patch("/todos/:todoId", async (req, res) => {
  // 변경할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;
  // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
  const { order, done, value } = req.body;

  // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  if (order) {
    // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }

  //done이 undefined가 아니라면, currentTodo의 doneAt가 done이라면 현재 시간, 아니면 null표시
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  //value데이터가 존재한다면, currentTodo의 value를 변경한다.
  if (value) {
    currentTodo.value = value;
  }
  // 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

/* 해야할 일 삭제 */
router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMassage: "존재하지 않는 해야할 일 정보입니다." });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
