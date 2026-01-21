import { Request, Response } from "express";
import BrandModel from "../schema/CarBrand.model";
import CarModel from "../schema/Car.model";
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

brandController.updateBrand = async (req: Request, res: Response) => {
    try {
        console.log('updateBrand', req.body, req.file);
        const { _id, BrandName } = req.body as any;
        if (!_id) throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);

        const update: any = {};
        if (BrandName) update.BrandName = BrandName;
        if (req.file && req.file.path) update.BrandImages = [req.file.path.replace(/\\/g, "/")];

        const result = await BrandModel.findByIdAndUpdate(_id, update, { new: true }).exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        res.send(`<script> alert("Brand updated"); window.location.replace('/admin/car/all') </script>`);
    } catch (err) {
        console.error("Error, updateBrand:", err);
        res.send(`<script> alert("Update failed"); window.location.replace('/admin/car/all') </script>`);
    }
};

brandController.getBrand = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const brand = await BrandModel.findById(id).exec();
        if (!brand) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return res.status(HttpCode.OK).json({ data: brand });
    } catch (err) {
        console.error('Error, getBrand:', err);
        if (err instanceof Errors) return res.status(err.code).json(err);
        return res.status(Errors.standart.code).json(Errors.standart);
    }
};

brandController.getAllBrands = async (req: Request, res: Response) => {
    try {
        // Disable caching for API responses to ensure fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const brands = await BrandModel.find().sort({ BrandName: 1 }).exec();
        return res.status(HttpCode.OK).json({ data: brands });
    } catch (err) {
        console.error('Error, getAllBrands:', err);
        if (err instanceof Errors) return res.status(err.code).json(err);
        return res.status(Errors.standart.code).json(Errors.standart);
    }
};

brandController.deleteBrand = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);

        // prevent deleting brands that are referenced by cars
        const used = await CarModel.findOne({ carBrand: id }).exec();
        if (used) return res.status(400).json({ message: 'Brand is used by existing cars. Reassign or remove cars first.' });

        const result = await BrandModel.findByIdAndDelete(id).exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return res.status(HttpCode.OK).json({ ok: true });
    } catch (err) {
        console.error('Error, deleteBrand:', err);
        if (err instanceof Errors) return res.status(err.code).json(err);
        return res.status(Errors.standart.code).json(Errors.standart);
    }
};

brandController.getTopBrands = async (req: Request, res: Response) => {
    try {
        const { limit } = req.query;
        const lim = Number(limit) > 0 ? Number(limit) : 10;
        const brands = await BrandModel.find().sort({ BrandViews: -1 }).limit(lim).exec();
        res.status(200).json({ data: brands });
    } catch (err) {
        console.error('Error, getTopBrands:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

export default brandController;

