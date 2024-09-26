import { Router } from 'express';
import {
    consultarTodos,
    consultarUno,
    insertar,
    modificar,
    eliminar
} from '../controllers/profesoresController';
import { AppDataSource } from '../db/conexion';
import { Profesor } from '../models/ProfesorModel'; 

const router = Router();

router.get('/listarProfesores', consultarTodos);

router.get('/crearProfesor', (req, res) => {
    res.render('crearProfesor', {
        pagina: 'Crear Profesor',
    });
});

router.get('/modificarProfesor/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesor = await profesorRepository.findOne({ where: { id: parseInt(id) } });

        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }

        
        res.render('modificarProfesor', {
            profesor,
            pagina: 'Modificar Profesor' 
        });
    } catch (err: unknown) {
        console.error('Error al obtener el profesor:', err);
        res.status(500).send('Error al obtener el profesor');
    }
});


router.post('/', insertar);
router.put('/:id', modificar);
router.delete('/:id', eliminar);

export default router;
