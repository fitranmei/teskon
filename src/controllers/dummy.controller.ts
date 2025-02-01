import {request, response} from "express";

export default {
    dummy(req = request, res = response) {
        res.status(200).json({ 
            message: "Dummy endpoint called", 
            data: "OK" 
        });
    }
};