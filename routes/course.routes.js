import {Router} from 'express';
import {getAllCourses,getLecturesByCourseId,updateCourse,createCourse,removeCourse,addLectureToCourseById} from '../controllers/course.controller.js';
import { isLoggedIn ,authrizedRoles, authrizeSubscriber} from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';


const router = Router();

router.route('/')
.get(getAllCourses)
.post(
    isLoggedIn,
    authrizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
);

router.route('/:id')
.get(isLoggedIn,authrizeSubscriber, getLecturesByCourseId)
.put(
    isLoggedIn,
    authrizedRoles('ADMIN'),
    updateCourse
)
.delete(
    isLoggedIn,
    authrizedRoles('ADMIN'),
    removeCourse
)
.post( 
    isLoggedIn,
    authrizedRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseById

);


export default router;