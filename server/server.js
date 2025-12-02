import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import axios from 'axios';
import dotenv from 'dotenv';
import { promises } from 'fs';
import fs from 'fs';
import { getMedicalSummaryFromGemini } from './services/summary.js';
import { getBodyPartImageFromGemini } from './services/imagen.js';

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
const upload=multer({
    dest: 'uploads/'
});
app.post('/api/analyze-report',upload.single('report'),async(req,res)=>{
    try{
        const file=req.file;
        if(!file){
            return res.status(400).json({error:'No file uploaded'});
        }
        const dataBuffer=Buffer.from(file.buffer || await fs.promises.readFile(file.path));
        const pdfData=new PDFParse({data:dataBuffer});
      
        const reportText=(await pdfData.getText()).text;
        console.log(reportText);
        // 3. Call Gemini for medical summary

        const analysis = await getMedicalSummaryFromGemini(reportText);

       // 4. Call Gemini for body-part image prompt / URL
        const imageResult = await getBodyPartImageFromGemini(analysis, reportText);

         return res.json({
      ...analysis,
        imageResult
    });

    }catch(err){
        console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });

    }

}
)
app.listen(3001,()=>{
    console.log('Server is running on port 3001');
});