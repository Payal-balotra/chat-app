import express from "express";
import { addContact, createProfile, deleteContact, getAllUsers, getContacts, updateProfile } from "./user.controller";
import { numberValidation } from "../../middleware/message.middleware";
import { verifyToken } from "../../middleware/auth.middleware";
const router = express.Router();

router.post("/profile/:id", createProfile);
router.put("/profile/:id", updateProfile);
router.post("/add",numberValidation,verifyToken,addContact);
router.get("/getContacts",verifyToken,getContacts);
router.delete("/deleteContact/:id",verifyToken,deleteContact);

router.get("/all-users",getAllUsers);
export default router;  
