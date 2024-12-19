import express from "express";
import { addRecptionist, editRecptionist, viewRecptionist, deleteReceptionist } from "../controllers/receptionistController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../../cloudinary/multer.js";
const router = express.Router();

router.post("/register", protect, upload.fields([{ name: "profilePicture", maxCount: 1 }]), addRecptionist);

router.post("/editReceptionist/:id", protect, upload.fields([
    { name: "profilePicture", maxCount: 1 },
]), editRecptionist);

router.get("/getReceptionist", protect, viewRecptionist);

router.delete('/deleteReceptionist/:id', protect, deleteReceptionist);



export default router;