import express from 'express';
import { deleteProduct, getProduct, getProductById, getSearchProduct,saveProduct, updateProduct } from '../controlers/productController.js';

const productRouter = express.Router();

productRouter.get("/", getProduct);

productRouter.post("/", saveProduct);

productRouter.delete("/:productId",deleteProduct);

productRouter.put("/:productId",updateProduct);

productRouter.get("/:productId",getProductById);
productRouter.get("/search/:query",getSearchProduct);
;

 
 

export default productRouter;
