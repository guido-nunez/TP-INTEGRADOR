import express, {Request, Response }  from "express";
import cors from 'cors';
import morgan from "morgan";
import path from "path";

import profesorRoutes from './routes/profesorRoutes';
import estudianteRouter from'./routes/estudianteRouter';
import cursosRouter from './routes/cursosRouter';
import inscripcionRouter from './routes/inscripcionRouter';

import methodOverride from 'method-override';

const app=express();

//habilitamos pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
//carpeta pblica
app.use(express.static('public'));

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cors());

app.get('/',(req:Request,res:Response)=>{
    return res.render('layout', {
        pagina: 'App Univerdsidad',
    });
});
app.use('/estudiantes', estudianteRouter);
app.use('/profesores', profesorRoutes);
app.use('/cursos', cursosRouter);
app.use('/inscripciones', inscripcionRouter);

export default app;

