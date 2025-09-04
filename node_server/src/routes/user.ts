import { Router } from "express";
import { UserController, KeycloakController } from "../controllers";

const router = Router();

router.get("/", UserController.get_all);
router.get("/:id", UserController.get_user_by_id);
router.post("/create", KeycloakController.createUser);
router.put("/update", UserController.updateUser);
router.post("/delete", UserController.deleteUser);

export default router;
