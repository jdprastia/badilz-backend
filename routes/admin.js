const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { upload, uploadMultiple } = require('../middlewares/multer');
const auth = require('../middlewares/auth');

router.get('/signin', adminController.viewLogin);
router.post('/signin', adminController.actionLogin);
router.get('/first-started', adminController.firstStarted);
router.post('/createFirst', adminController.createFirst);
router.use(auth);
router.post('/logout', adminController.actionLogout);
router.post('/create', adminController.createAcccount);

router.get('/dashboard', adminController.viewDashboard);

router.get('/userlist', adminController.viewAdminlist);
router.get('/add-user', adminController.addPageAdminlist);
router.delete('/userlist/:id', adminController.deleteUser);

router.get('/configuration', adminController.viewConfiguration);
router.post('/configuration', adminController.addConfiguration);
router.put('/configuration', adminController.editConfiguration);

router.get('/band', adminController.viewBand);
router.get('/add-band', adminController.addPageBand);
router.post('/add-band', uploadMultiple, adminController.addBand);
router.get('/band/:id', uploadMultiple, adminController.editPageBand);
router.put('/band/:id', uploadMultiple, adminController.editBand);
router.delete('/band/:id', adminController.deleteBand);

router.get('/project', adminController.viewProject);
router.get('/add-project', adminController.addPageProject);
router.post('/add-project', upload, adminController.addProject);
router.get('/project/:id', adminController.editPageProject);
router.put('/project/:id', upload, adminController.editProject);
router.delete('/project/:id', adminController.deleteProject);

router.get('/portofolio', adminController.viewPortofolio);
router.get('/portofolio/add-video', adminController.addPagePortofolio);
router.post('/portofolio-video', adminController.addPortofolio);
router.get('/portofolio-video/:id', adminController.editPagePortofolio);
router.put('/portofolio-video/:id', adminController.editPortofolio)
router.delete('/portofolio-video/:id', adminController.deletePortofolio);

router.get('/category', adminController.viewCategory);
router.post('/category', adminController.addCategory);
router.put('/category', adminController.editCategory);
router.delete('/category/:id', adminController.deleteCategory);

router.get('/journal', adminController.viewJournal);
router.get('/add-journal', adminController.addPageJournal);
router.post('/add-journal', uploadMultiple, adminController.addJournal);
router.get('/journal/:id', uploadMultiple, adminController.editPageJournal);
router.put('/journal/:id', uploadMultiple, adminController.editJournal);
router.delete('/journal/:id', adminController.deleteJournal);

module.exports = router;