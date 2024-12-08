import express, { Request, Response } from "express";
import dotenv from "dotenv";
const app = express();

dotenv.config()
app.use(express.json()); 


app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript!");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
