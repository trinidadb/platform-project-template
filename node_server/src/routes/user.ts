import { Router } from "express";
import { UserController } from "../controllers/userController";
import { keycloakAdminService } from '../services/keycloak';

const router = Router();
router.get("/", UserController.get_all);
router.get("/:id", UserController.get_user_by_id);
//router.post("/create", UserController.createUser);
router.put("/update", UserController.updateUser);
router.post("/delete", UserController.deleteUser);


router.post('/create', async (req, res, next) => {
  try {
    const { username, email, name, lastname, password } = req.body;
    
    // Basic validation
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    await keycloakAdminService.createUser({ username, email, name, lastname, password });
    
    res.status(201).json({ message: `User '${username}' created successfully.` });
  } catch (error) {
    next(error); // Pass error to your global error handler
  }
});


export default router;
