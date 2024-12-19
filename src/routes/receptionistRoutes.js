import express from "express";
import { addRecptionist, editRecptionist, viewRecptionist, deleteReceptionist } from "../controllers/receptionistController.js";
import { doctor, patient, protect, receptionist } from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { registerPatient, editPatient, getAllPatients, getPatientById } from "../controllers/patientController.js";
import {createAppointment , DeleteAppointment  , CancelAppointment , UpdateAppointment  , AllTodaysAppointment , AllAppointmentById , } from "../controllers/appointmentController.js";
import upload from "../../cloudinary/multer.js";
const router = express.Router();

router.post("/register", protect, upload.fields([
    { name: "profilePicture", maxCount: 1 },
]), addRecptionist);

router.post("/editReceptionist/:id", protect, authorize(["receptionist"]), upload.fields([
    { name: "profilePicture", maxCount: 1 },
]), editRecptionist);

router.get("/getReceptionist", protect, authorize(["receptionist"]), viewRecptionist);

router.delete('/deleteReceptionist/:id', protect, authorize(["receptionist"]), deleteReceptionist);

router.get("/getAllPatient", protect, authorize(["receptionist"]), getAllPatients);
router.get("/getPatient/:id", protect, authorize(["receptionist"]), getPatientById);
router.post("/addPatient", protect, authorize(["receptionist"]), registerPatient);  
router.put("/editPatient/:id", protect, authorize(["receptionist"]), editPatient);

router.post("/createAppointment", protect, authorize(["receptionist"]), createAppointment);
router.get("/AllTodaysAppointment", protect, authorize(["receptionist"]), AllTodaysAppointment);
router.get("/AllAppointmentById/:id", protect, authorize(["receptionist"]), AllAppointmentById);
router.put("/UpdateAppointment/:id", protect, authorize(["receptionist"]), UpdateAppointment);
router.put("/CancelAppointment/:id", protect, authorize(["receptionist"]), CancelAppointment);  
router.delete("/DeleteAppointment/:id", protect, authorize(["receptionist"]), DeleteAppointment);

export default router;