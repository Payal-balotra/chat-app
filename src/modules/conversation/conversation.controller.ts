import { Request, Response } from "express";
import { findUserByPhone } from "../user/user.services";
import { Conversation } from "./conversation.model";

export const conversation = (req : Request,res :Response) =>{
    
}
export const changeAdmin = (req : Request,res :Response) =>{
    const {phone}  = req.body;
    const existingAdmin = req.user;
    const user = findUserByPhone(phone);

}