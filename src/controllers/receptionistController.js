import Receptionist from "../models/receptionistmodel.js";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { client } from "../redis.js";
import { CACHE_TIMEOUT } from "../constants.js";
import registration from '../services/emailServices.js'
import receptionistModel from "../models/receptionistmodel.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

export const addRecptionist = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0 || !req.user || !req.user.hospital) {
            return res.status(400).json({ message: "Invalid request body or Unauthorized" });
        }
        const checkmail = await Receptionist.findOne({ email: req.body.email, hospitalId: req.user.hospital });
        if (checkmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (req.files) {
            if (req.files?.profilePicture?.[0]?.path) {
                req.body.profilePicture = req.files.profilePicture[0].path;
            }
        }
        const password = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            email: req.body.email,
            fullName: `${req.body.firstName} ${req.body.lastName}`,
            phone: req.body.phone,
            gender: req.body.gender,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            zipCode: req.body.zipCode,
            address: req.body.address,
            password: hashedPassword,
            hospitalId: req.user.hospital,
            qualification: req.body.qualification,
            emergencyContactNo: req.body.emergencyContactNo,
            workingTime: req.body.workingTime,
            breakTime: req.body.breakTime,
            profilePicture : req.body.profilePicture,
        };

        const newReceptionist = new Receptionist(data);
        await newReceptionist.save();
        if (newReceptionist) {
            try {
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                });
                const htmlMessage = registration(req.body.fullName, req.body.email, password);
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: req.body.email,
                    subject: "Registration Successful ✔",
                    text: `Hello ${req.body.fullName}, You've successfully registered.`,
                    html: htmlMessage,
                });
            } catch (emailError) {
                return res.status(400).json({ message: "User registered, but email sending failed" });
            }
            return res.status(200).json({ message: "receptionist registered Successfully" });
        }
    } catch (error) {
        console.error("Error adding receptionist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const editRecptionist = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0 || !req.user || !req.user.hospital) {
            return res.status(400).json({ message: "Invalid request body or Unauthorized" });
        }

        const receptionistId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
            return res.status(400).json({ message: "Invalid Doctor ID" });
        }

        const existingReceptionist = await Receptionist.findById(receptionistId);
        if (!existingReceptionist) {
            return res.status(404).json({ message: "Receptionist not found" });
        }

        const updatedData = {
            email: req.body.email ? req.body.email : existingReceptionist.email,
            fullName: `${req.body.firstName} ${req.body.lastName}`,
            phone: req.body.phone ? req.body.phone : existingReceptionist.phone,
            gender: req.body.gender ? req.body.gender : existingReceptionist.gender,
            country: req.body.country ? req.body.country : existingReceptionist.country,
            state: req.body.state ? req.body.state : existingReceptionist.state,
            city: req.body.city ? req.body.city : existingReceptionist.city,
            zipCode: req.body.zipCode ? req.body.zipCode : existingReceptionist.zipCode,
            address: req.body.address ? req.body.address : existingReceptionist.address,
            qualification: req.body.qualification ? req.body.qualification : existingReceptionist.qualification,
            emergencyContactNo: req.body.emergencyContactNo ? req.body.emergencyContactNo : existingReceptionist.emergencyContactNo,
            workingTime: req.body.workingTime ? req.body.workingTime : existingReceptionist.workingTime,
            breakTime: req.body.breakTime ? req.body.breakTime : existingReceptionist.breakTime
        };

        if (req.files["profilePicture"] && req.files["profilePicture"][0] && req.files["profilePicture"][0].path) {
            if (existingReceptionist.profilePicture) {
                const publicId = existingReceptionist.profilePicture.split("/").pop().split(".")[0];
                await cloudinaryConfig.uploader.destroy(`books_image/${publicId}`);
            }
            updatedData.profilePicture = req.files["profilePicture"][0].path;
        }
        await Receptionist.findByIdAndUpdate(receptionistId, updatedData, { new: true });

        return res.status(200).json({ message: "Receptionist updated successfully" });
    } catch (error) {
        console.error("Error editing receptionist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const loginReceptionist = async (req, res) => {
    try {
        const { identifier, password, rememberMe } = req.body;

        if (!identifier || !password) {
            return res
                .status(400)
                .json({ message: "Please provide email/phone and password" });
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();

        const normalizedPhone = identifier.trim().replace(/[\s\-\(\)]/g, "");

        const receptionist = await receptionistModel.findOne({
            $or: [{ email: normalizedIdentifier }, { phone: normalizedPhone }],
        });

        if (!receptionist) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, receptionist.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const [firstName, lastName] = receptionist.fullName.split(" ");
        // Generate JWT token
        const token = jwt.sign(
            { id: receptionist._id, role: "receptionist" },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? "7d" : "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: receptionist._id,
                firstName: firstName,
                lastName: lastName,
                email: receptionist.email,
                phone: receptionist.phone,
                role: "receptionist",
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const viewRecptionist = async (req, res) => {
    try {
        if (!req.user || !req.user.hospital) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        const receptionistId = req.query.id;
        if (receptionistId) {
            if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
                return res.status(400).json({ message: "Invalid Receptionist ID" });
            }
            const existingReceptionist = await Receptionist.find({ _id: receptionistId, hospitalId: req.user.hospital });
            if (!existingReceptionist) {
                return res.status(404).json({ message: "Receptionist not found" });
            }
            return res.status(200).json({ message: "Receptionist Data fetched successfully", status: 1, data: existingReceptionist });
        } else {
            const receptionists = await Receptionist.find({ hospitalId: req.user.hospital });
            return res.status(200).json({ message: "Receptionist Data fetched successfully", status: 1, data: receptionists });
        }
    } catch (error) {
        console.error("Error fetching receptionist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const deleteReceptionist = async (req, res) => {
    try {
        if (!req.user || !req.user.hospital) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (req.params.id) {
            const receptionistId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
                return res.status(400).json({ message: "Invalid Receptionist ID" });
            }
            const existingReceptionist = await Receptionist.findByIdAndDelete(receptionistId);
            if (!existingReceptionist) {
                return res.status(404).json({ message: "Receptionist not found" });
            }
            return res.status(200).json({ message: "Receptionist Deleted Succesfully" });
        } else {
            return res.status(400).json({ message: "Parameter(id) is missing" });
        }
    } catch (error) {
        console.error("Error fetching receptionist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}