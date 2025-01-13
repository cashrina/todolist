import {NextFunction, Request, Response} from 'express';
import {HydratedDocument} from "mongoose";
import {UserFields, UserMethods} from "../types";
import User from "../models/User";

export interface RequestWithUser extends Request {
  user?: HydratedDocument<UserFields, UserMethods>;
}

const auth = async (expressReq: Request,res:Response,next:NextFunction) => {
  const req = expressReq as RequestWithUser;

  const token = req.get('Authorization');
  if (!token) {
    res.status(401).send({error: 'No token present'});
    return;
  }
  const user = await User.findOne({token});
  if (!user) {
    res.status(401).send({error: 'Wrong token!'});
    return
  }

  req.user = user;
  next();
};

export default auth;