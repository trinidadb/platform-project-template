import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

router.post("/create", UserController.createUser);
router.put("/update", UserController.updateUser);
// router.post("/delete", UserController.deleteUser);

export default router;