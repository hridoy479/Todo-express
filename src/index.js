import express from "express"
import dotenv from "dotenv"
import prisma from "./db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Absolute path to /public so it works on Vercel, not just locally
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");


const app = express();
dotenv.config();
app.use(express.json());
app.use(express.static(publicDir));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
const PORT = process.env.PORT || 3001;



app.get('/todos',async(req,res)=>{
    try{
        const todos = await prisma.todo.findMany();
       return res.status(200).json(todos)
    }catch(error){
        console.log(error)
      return  res.status(500).json({
            message:"Server erorr"
        })
    }
});

app.post('/todos',async(req,res)=>{

    const {title, completed} = req.body;

    if(!title || typeof title != "string" || title.trim()==""){
        return res.status(400).json({
            message:"Must have Title and it's should string"
        })
    }
    if( typeof completed !="boolean"){
        return res.status(400).json({
            messege:"Type of completed must have boolean"
        })
    }
    try{
        const todo = await prisma.todo.create({
           data:{
                title:title.trim(),
                completed:completed
           }

        });
     return res.status(201).json({
            message:"Todo added successfully",
            data:todo
        })
    }catch(error){
        
        console.log(error);

      return  res.status(500).json({
            message:"Failed to create todo"
        })

    }

    
})

app.get('/todo/:id',async(req,res)=>{
    const id = Number(req.params.id);
try{
    const todo = await prisma.todo.findUnique({
        where:{
            id:id
        }
    })
    
    if(!todo){
       return res.status(404).json({
            "status":"todos not found"
        })
    }
    return res.status(200).send(todo);
}catch(erorr){
    console.log(erorr);

    return res.status(500).json({
        message:"Server erorr"
    })
}
})

app.put('/todo/:id',async (req,res)=>{
    const {title,completed} = req.body;
    const id = Number(req.params.id);

  
    if(!title || typeof title != "string" || title.trim()==""){
        return res.status(400).json({
            message:"Title must be a non-empty string"
        })
    }
    if(typeof completed != "boolean"){
         return res.status(400).json({
            message:"Completed must be a Boolean."
        })
    }
    try{
        const todo = await prisma.todo.update({
            where:{
                id:id
            },
            data:{
                title:title.trim(),
                completed:completed
            }
        });
       return res.status(200).json({
         message:"todo updated",
         data:todo
         });

    }catch(erorr){
        console.log(erorr);
        res.status(501).json({
            message:"Server erorr"
        })
    }

    
    

})

app.delete('/todo/:id', async(req, res) => {

    // 1. Get the ID
    const id = Number(req.params.id);

   try{
        const todo = await prisma.todo.delete({
            where:{
                id:id
            }
        });

      return res.status(200).json({
        message: "Todo deleted successfully",
        data: todo
    });

   }catch(erorr){
        console.log(erorr);
        res.status(501).json({
            message:"Server erorr"
        })
    }


 
   
});




















// Vercel runs the exported app as a function; only listen when running locally
if (!process.env.VERCEL) {
    app.listen(PORT,()=>{
        console.log(`Server Started at http://localhost:${PORT}`);
    })
}

export default app;
