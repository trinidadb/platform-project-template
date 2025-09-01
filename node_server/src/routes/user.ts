import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();
router.get("/", UserController.get_all);
router.get("/:id", UserController.get_user_by_id);
router.post("/create", UserController.createUser);
router.put("/update", UserController.updateUser);
router.post("/delete", UserController.deleteUser);

export default router;
