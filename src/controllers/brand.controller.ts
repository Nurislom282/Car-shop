import { Request, Response } from "express";
import BrandModel from "../schema/CarBrand.model";
import Errors, { HttpCode, Message } from "../libs/Errors";

const brandController: any = {};

brandController.createBrand = async (req: Request, res: Response) => {
    try {
        console.log("createBrand", req.body, req.file);
        const { BrandName } = req.body;
        if (!BrandName) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        const brandData: any = { BrandName };
        if (req.file && req.file.path) brandData.BrandImages = [req.file.path.replace(/\\/g, "/")];

        await BrandModel.create(brandData);

        res.send(`<script> alert("Brand created"); window.location.replace('/admin/car/all') </script>`);
    } catch (err) {
        console.error("Error, createBrand:", err);
        res.send(`<script> alert("Create failed"); window.location.replace('/admin/car/all') </script>`);
    }
};

export default brandController;
