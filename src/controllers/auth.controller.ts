import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { Types } from "mongoose";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type TLogin = {
    identifier: string;
    password: string;
}

const registerValidateSchema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string()
        .required().min(8, "password must be at least 8 characters")
        .test("at-least-one-uppercase-letter", "Contains at least one uppercase letter", (value) => {
            if (!value) {
                return false;
            } else {
                const regex = /^(?=.*[A-Z])/;
                return regex.test(value);
            }
        }).test("at-least-one-uppercase-number", "Contains at least one number", (value) => {
            if (!value) {
                return false;
            } else {
                const regex = /^(?=.*\d)/;
                return regex.test(value);
            }
        }),
    confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref('password'), ""], 'Passwords do not match')
});

export default {
    /**
        #swagger.tags = ['Auth'] 
     */
    async register(req: Request, res: Response) {
        const { fullName, username, email, password, confirmPassword } = 
            req.body as unknown as TRegister;

        try {

            await registerValidateSchema.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword
            });

            const result = await UserModel.create({
                fullName,
                username,
                email,
                password
            });

            res.status(200).json({
                message: "Registration successful!",
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ 
                message: err.message,
                data: null
            });
        }
    },

    async login(req: Request, res: Response) {
        /** 
            #swagger.tags = ['Auth']
            #swagger.requestBody = {
                required: true,
                schema: {$ref: "#/components/schemas/LoginRequest"}
            }
        */
        const { identifier, password } = req.body as unknown as TLogin;

        try {
            // Ambil Data User berdasarkan identifier -> Email dan Username
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    { email: identifier }, 
                    { username: identifier }
                ],
                isActive: true
            });

            if (!userByIdentifier) {
                return res.status(404).json({
                    message: "User not found",
                    data: null
                });
            }
            // Validasi Password
            const validatePassword: boolean = 
                encrypt(password) === userByIdentifier.password;

            if (!validatePassword) {
                return res.status(401).json({
                    message: "Invalid password",
                    data: null
                });
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
                activationCode: userByIdentifier.activationCode
            });

            res.status(200).json({
                message: "Login successful!",
                data: {
                    token
                }
            });

        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ 
                message: err.message,
                data: null
            });
        }
    },

    async me (req: IReqUser, res: Response) {
        /** 
            #swagger.tags = ['Auth']
            #swagger.security = [{
                "bearerAuth": []
            }]
        */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({
                message: "Successfully!",
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ 
                message: err.message,
                data: null
            });
        }
    },

    async activation (req: Request, res: Response) {
        /** 
            #swagger.tags = ['Auth']
            #swagger.requestBody = {
                required: true,
                schema: {$ref: "#/components/schemas/ActivationRequest"}
            }
        */
        try {
            const { code } = req.body as { code: string };

            const user = await UserModel.findOneAndUpdate(
                { activationCode: code }, 
                { isActive: true },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found or activation code is invalid",
                    data: null
                });
            } else {
                res.status(200).json({
                    message: "User activated successfully!",
                    data: user
                });
            }
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ 
                message: err.message,
                data: null
            });
        }
    },
};