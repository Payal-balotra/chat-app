import { Request, Response } from "express";

export const conversation = (req : Request,res :Response) =>{
    const  { participants  ,messageId} = req.body;
    let isGroup  = false
    if(participants.length > 2){
        isGroup = true
    }
    
}