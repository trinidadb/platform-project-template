import express from "express";
import { AuthController } from "../controllers";

const router = express.Router();

router.post("/signin", AuthController.login);
router.get("/user", AuthController.user);

export default router;
