import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

export default function errorHandler(err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err)
  }
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let erroDetails = err;

  //PrimaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!"
  }
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === "P2025") {
      errorMessage = "An operation failed because it depends on one or more records that were required but not found. No record was found for a query."
    }
    else if (err.code = "P2002") {
      errorMessage = "Unique constraint failed"
    }
    else if (err.code = "P2007") {
      errorMessage = "Data validation error"
    }
  } 
  else if(err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "An error occured during qury execution!"
  }
  else if(err instanceof Prisma.PrismaClientInitializationError) {
    if(err.errorCode = 'P1000') {
      statusCode = 401;
      errorMessage = "Authentication failed against database server"
    }
    else if(err.errorCode = 'P1001') {
      statusCode = 400;
      errorMessage = "Can't reach database server"
    }
  }

  res.status(500)
  res.json({
    message: errorMessage,
    error: erroDetails,
  })
}

