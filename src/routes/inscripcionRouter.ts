import express from 'express';
const router=express.Router();
import { calificar, cancelarInscripcion, consultarInscripciones, consultarxAlumno, consultarxCurso, inscribir, mostrarFormularioInscripcion, mostrarModificarInscripcion,modificarInscripcion  } from '../controllers/inscripcionController';

router.get('/listarInscripciones',consultarInscripciones);
router.get('/xAlumno/:id',consultarxAlumno );
router.get('/xCurso/:id',consultarxCurso );

router.get('/crearInscripcion', mostrarFormularioInscripcion);

router.get('/modificarInscripcion/:estudiante_id/:curso_id', mostrarModificarInscripcion);
router.post('/modificarInscripcion/:estudiante_id/:curso_id', modificarInscripcion);

router.post('/',inscribir );
router.put('/',calificar );
router.delete('/:estudiante_id/:curso_id',cancelarInscripcion);

export default router;