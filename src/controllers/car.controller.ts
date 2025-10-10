import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { CarInput, CarInquiry, CarUpdateInput } from "../libs/types/car";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { CarType } from "../libs/enums/car.enum";
import CarService from "../models/Car.service";
import BrandModel from "../schema/CarBrand.model";

const carService = new CarService();
const carController: T = {};

/* SPA */
carController.getCars = async (req: Request, res: Response) => {
  try {
    console.log("getCars");
    const { page, limit, order, carType, search } = req.query;
    const inquiry: CarInquiry = {
      order: String(order), //property
      page: Number(page), //default 1
      limit: Number(limit), //default 10
      carType: carType ? (carType as CarType) : undefined,
      search: search ? String(search) : undefined,
    };
    console.log(inquiry);
    if (carType) {
      inquiry.carType = carType as CarType;
    }
    if (search) inquiry.search = String(search);

    const result = await carService.getCars(inquiry);
    console.log(result);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getCars:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
}

carController.getCar = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getCar");
    const { id } = req.params;
    console.log("req.member:", req.member);

    const memberId = req.member?._id ?? null,
      result = await carService.getCar(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getCar:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
}

// Rendered public page for a car (used by /car/:id link in the listing)
carController.getCarPage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await carService.getCarById(id);
    // render a simple car view
    return res.render('car', { car: data });
  } catch (err) {
    console.log('Error, getCarPage:', err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standart.code).json(Errors.standart);
  }
}

/* SSR */

carController.getAllCars = async (req: Request, res: Response) => {
  try {
    console.log("getAllCars");
    const { page, limit, order, carType, search } = req.query;
    const inquiry = {
      page: Number(page) || 1,
      limit: Number(limit) || 12,
      order: String(order || ''),
      carType: carType ? (carType as any) : undefined,
      brand: (req.query.brand as string) || undefined,
      search: search ? String(search) : undefined,
    };
    const paged = await carService.getCarsSSR(inquiry);
    // fetch brands to populate brand select in the modal
    const brands = await BrandModel.find().exec();
    res.render("cars", { cars: paged.data, brands, pagination: { total: paged.total, page: paged.page, limit: paged.limit, pages: paged.pages, query: req.query } });
  } catch (err) {
    console.log("Error, getAllCars:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
}

carController.createNewCar = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewCar");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    if (!req.files?.length)
      throw new Errors(
        HttpCode.INTERNATIONAL_SERVER_ERROR,
        Message.CREATE_FAILED
      );

    const data: CarInput = req.body;
    data.carImages = req.files?.map((ele) => {
      // normalize path separators and store path relative to uploads root
      const p = ele.path.replace(/\\/g, "/");
      // remove any leading ./ or / and the uploads/ prefix
      return p.replace(/^(?:\.\/|\/)*/g, "").replace(/^uploads\//, "");
    });

    await carService.createNewCar(data);

    res.send(
      `<script> alert("Sucessful creation!"); window.location.replace('/admin/car/all') </script>`
    );
  } catch (err) {
    console.log("Error, createNewCar:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/car/all') </script>`
    );
  }
};

carController.getDiscountedCars = async (req: Request, res: Response) => {
  try {
    console.log("getDiscountedCars");
    const { page, limit, order, carType, search } = req.query;
    const inquiry: CarInquiry = {
      order: String(order),
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      carType: carType ? (carType as CarType) : undefined,
      search: search ? String(search) : undefined,
    };

    const result = await carService.getDiscountedCars(inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getDiscountedCars:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

carController.getTopViewedCars = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const lim = Number(limit) > 0 ? Number(limit) : 10;
    const result = await carService.getTopViewedCars(lim);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, getTopViewedCars:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

carController.getCarsByBrand = async (req: Request, res: Response) => {
  try {
    const brandId = req.params.brandId;
    const { page, limit, order, carType, search } = req.query;
    const inquiry: CarInquiry = {
      order: String(order),
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      carType: carType ? (carType as CarType) : undefined,
      search: search ? String(search) : undefined,
    };

    const result = await carService.getCarsByBrand(inquiry, brandId);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, getCarsByBrand:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

carController.updateCar = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("updateCar");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // allow updates without supplying new files
    const data: CarInput = req.body;
    // if files were uploaded, normalize their paths and merge with existing images
    if (req.files && req.files.length) {
      const uploaded = req.files.map((ele) => {
        const p = ele.path.replace(/\\/g, "/");
        return p.replace(/^(?:\.\/|\/)*/g, "").replace(/^uploads\//, "");
      });
      // fetch existing car to avoid overwriting its images
      const maybeId = (data as any)._id || null;
      if (maybeId) {
        try {
          const existing = await carService.getCarById(String(maybeId));
          const existingImgs = Array.isArray(existing.carImages) ? existing.carImages : [];
          data.carImages = existingImgs.concat(uploaded).slice(0, 5);
        } catch (e) {
          // if fetching existing fails, just use uploaded list
          data.carImages = uploaded.slice(0, 5);
        }
      } else {
        data.carImages = uploaded.slice(0, 5);
      }
    } else {
      // if no files provided, make sure we don't accidentally unset carImages on update
      if ((data as any).carImages === undefined) delete (data as any).carImages;
    }

    await carService.updateCar(data as CarUpdateInput);

    res.send(
      `<script> alert("Sucessful update!"); window.location.replace('/admin/car/all') </script>`
    );
  } catch (err) {
    console.log("Error, updateCar:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/car/all') </script>`
    );
  }
};

carController.getupdateChosenCar = async (req: Request, res: Response) => {
  try {
    console.log("getupdateChosenCar");
    const id = req.params.id;
    // Render an admin edit page for the car so admins can edit fields (including discount)
    const result = await carService.getCarById(id);
    // fetch brands to populate brand select
    const brands = await BrandModel.find().exec();
    return res.render('car-edit', { car: result, brands });
  } catch (err) {
    console.log("Error, getupdateChosenCar:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

// Return car data as JSON for admin edit modal (no status filter)
carController.getCarData = async (req: Request, res: Response) => {
  try {
    console.log('getCarData');
    const id = req.params.id;
    const result = await carService.getCarById(id);
    return res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log('Error, getCarData:', err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standart.code).json(Errors.standart);
  }
};

carController.updateChosenCar = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenCar");
    const id = req.params.id;
    const result = await carService.updateChosenCar(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenCar:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

carController.deleteCar = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    // soft delete by setting status to DELETE
    const result = await carService.deleteChosenCar(id, { carStatus: 'DELETE' } as any);
    if (result) return res.status(200).json({ ok: true });
    return res.status(400).json({ ok: false });
  } catch (err) {
    console.log('Error, deleteCar:', err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(500).json({ message: 'Delete failed' });
  }
};


export default carController;