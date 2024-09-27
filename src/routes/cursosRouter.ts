import express from 'express';
import { consultarTodos, consultarUno, eliminar, insertar, modificar, mostrarFormularioCrearCurso, validarCurso } from '../controllers/cursoController';

const router = express.Router();

router.get('/listarCursos', consultarTodos);
router.get('/crearCurso', mostrarFormularioCrearCurso); 
router.post('/crearCurso', validarCurso(), insertar);

router.get('/modificarCurso/:id', consultarUno); 
router.post('/modificarCurso/:id', validarCurso(), modificar);


router.route('/:id')
    .get(validarCurso(),consultarUno)
    .put(validarCurso(),modificar)
    .delete(eliminar);

export default router;