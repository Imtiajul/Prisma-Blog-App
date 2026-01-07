import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                name: string,
                role: string,
                emailVerified: boolean,
            }
        }
    }
}
export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

const auth = (...roles: UserRole[]) => {
    // console.log(roles);
    return async (req: Request, res: Response, next: NextFunction) => {
        //get user session
        const session = await betterAuth.api.getSession({
            headers: req.headers as any,
        });
        console.log(session);

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "You are not authorised"
            })
        }
        if (!session.user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Email Verification required. Please verify your email"
            })
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as string,
            emailVerified: session.user.emailVerified
        }

        if(roles.length && !roles.includes(req.user.role as UserRole)) {
            return res.status(403).json({
                suceess: false,
                message: "Forbidden! You don't have perssion to access this resources!"
            })
        }
        // console.log(session);

        next();
    }
}

export default auth;