import express from 'express';
import { consultarTodos, consultarUno, eliminar, insertar, modificar, mostrarFormularioCrearCurso } from '../controllers/cursoController';

const router = express.Router();

router.get('/listarCursos', consultarTodos);
router.get('/crearCurso', mostrarFormularioCrearCurso); 

router.post('/', insertar);

router.get('/modificarCurso/:id', consultarUno); 
router.post('/modificarCurso/:id', modificar);

router.route('/:id')
    .get(consultarUno)
    .put(modificar)
    .delete(eliminar);

export default router;