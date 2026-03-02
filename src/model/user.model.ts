import mongoose, { Model, Schema } from "mongoose";

const userSchema = new Schema({
  phone: {
    type: Number,
    unique: true,
    required :true
  },
  name : {
    type : String, 
  },
  isOnline : {
    type : Boolean
  }
},{timestamps : true});

const User = new Model("User",userSchema);