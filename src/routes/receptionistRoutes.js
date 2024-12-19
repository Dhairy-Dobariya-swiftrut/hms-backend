import express from "express";
import { addRecptionist, editRecptionist, viewRecptionist, deleteReceptionist } from "../controllers/receptionistController.js";
import { doctor, patient, protect, receptionist } from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { registerPatient, editPatient, getAllPatients, getPatientById } from "../controllers/patientController.js";
import {createAppointment , DeleteAppointment  , CancelAppointment , UpdateAppointment  , AllTodaysAppointment , AllAppointmentById , } from "../controllers/appointmentController.js";
import { createBill,deleteBill,getBillById,getBills,getbillsByPatientId,updateBill,getInsuranceBills,} from "../controllers/bill.controller.js";
import upload from "../../cloudinary/multer.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";

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
router.get("/allTodaysAppointment",cacheMiddleware, protect, authorize(["receptionist"]), AllTodaysAppointment);
router.get("/allAppointmentById/:id",cacheMiddleware, protect, authorize(["receptionist"]), AllAppointmentById);
router.put("/updateAppointment/:id",cacheMiddleware, protect, authorize(["receptionist"]), UpdateAppointment);
router.put("/cancelAppointment/:id",cacheMiddleware,  protect, authorize(["receptionist"]), CancelAppointment);  
router.delete("/deleteAppointment/:id",cacheMiddleware, protect, authorize(["receptionist"]), DeleteAppointment);


router.post("/createbill",protect,authorize(["receptionist"]) ,  createBill); //
router.get("/getbill", cacheMiddleware,authorize([ "receptionist"]), getBills); //
router.get("/getbillsById",protect,authorize(["receptionist"]),cacheMiddleware,getbillsByPatientId); //bill/getbillsById
router.get("/getInsuranceBills",protect, cacheMiddleware, authorize(["receptionist"]), getInsuranceBills);
router.get("/singlebill/:id", cacheMiddleware,protect, authorize(["receptionist"]), getBillById);
router.put("/billupdate/:id",   protect, authorize(["receptionist"]), updateBill);
router.delete("/deletebill/:id",    protect, authorize(["receptionist"]), deleteBill);


export default router;