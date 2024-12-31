import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CssBaseline,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccountsPage from './pages/AccountsPage';
import ProjectsPage from './pages/ProjectsPage';
import ServicesPage from './pages/ServicesPage';
import BudgetsPage from './pages/BudgetsPage';
import './App.css';

interface Account {
  accountId: string;
  name: string;
}
interface Project {
  projectId: string;
  accountId: string;
  name: string;
}
interface Service {
  serviceId: string;
  name: string;
}
interface Budget {
  id: string;
  account: string;
  project: string;
  service: string;
  month: string[];
  budget: number;
}

const mockAccounts: Account[] = [
  { accountId: '011C5C-37C2B8-892DE7', name: 'CLARO MERCADEO - ATTACH' },
  { accountId: '01E4DE-8C7813-321AE0', name: 'Cuenta Demo 2' }
];
const mockProjects: Project[] = [
  {
    projectId: 'claro-rai-otros-items-p-921',
    accountId: '011C5C-37C2B8-892DE7',
    name: 'CLARO - RAI - OTROS ELEMENTOS'
  },
  {
    projectId: 'claro-rai-vtex-p-2023',
    accountId: '01E4DE-8C7813-321AE0',
    name: 'CLARO - RECOMENDADOR VTEX 2'
  }
];
const mockServices: Service[] = [
  { serviceId: 'service-1', name: 'Recommendations AI' },
  { serviceId: 'service-2', name: 'BigQuery' },
  { serviceId: 'service-3', name: 'Cloud Storage' },
  { serviceId: 'service-4', name: 'Compute Engine' }
];
const mockBudgets: Budget[] = [
  {
    id: 'b1',
    account: '01E4DE-8C7813-321AE0',
    project: 'claro-rai-vtex-p-2023',
    service: 'service-2',
    month: ['01', '02'],
    budget: 1000.5
  },
  {
    id: 'b2',
    account: '011C5C-37C2B8-892DE7',
    project: 'claro-rai-otros-items-p-921',
    service: 'service-1',
    month: ['03'],
    budget: 3000
  }
];

const firebaseConfig = {
  apiKey: "AIzaSyA15LOu9wpnJhWwqQFKABSVPUKyEOTLGo4",
  authDomain: "claro---consumo-grafana---desa.firebaseapp.com",
  projectId: "claro---consumo-grafana---desa",
  storageBucket: "claro---consumo-grafana---desa.firebasestorage.app",
  messagingSenderId: "891037117280",
  appId: "1:891037117280:web:e909b096d64e01265b4c05",
  measurementId: "G-H23JPDHMN4"
};

function App() {
  console.log("Inicializando la app con el siguiente config de Firebase:", firebaseConfig);

  const app = initializeApp(firebaseConfig);
  console.log("Firebase app inicializado. Procediendo a obtener Firestore...");

  const db = getFirestore(app);
  console.log("Firestore obtenido:", db);

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Función para cargar colecciones con onSnapshot
  const loadCollection = <T,>(
    collName: string,
    transform: (snap: QuerySnapshot<DocumentData>) => T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    console.log("Intentando cargar la colección:", collName);

    const unsub = onSnapshot(
      collection(db, collName),
      (snap) => {
        console.log(`Snapshot recibido para la colección "${collName}". Cantidad de docs:`, snap.docs.length);
        const data = transform(snap);
        console.log(`Data transformada para "${collName}":`, data);
        setter(data);
      },
      (error) => {
        console.error(`Error cargando la colección "${collName}":`, error);
      }
    );

    return unsub;
  };

  // Efecto para cargar datos de Firestore
  useEffect(() => {
    console.log("useEffect -> Iniciando suscripciones a las colecciones de Firestore...");

    const unsubAcc = loadCollection<Account>(
      'account',
      (snap) =>
        snap.docs.map((doc) => ({
          accountId: doc.id,
          ...(doc.data() as Pick<Account, 'name'>)
        })),
      setAccounts
    );

    const unsubProj = loadCollection<Project>(
      'project',
      (snap) =>
        snap.docs.map((doc) => ({
          projectId: doc.id,
          ...(doc.data() as Omit<Project, 'projectId'>)
        })),
      setProjects
    );

    const unsubServ = loadCollection<Service>(
      'service',
      (snap) =>
        snap.docs.map((doc) => ({
          serviceId: doc.id,
          ...(doc.data() as Pick<Service, 'name'>)
        })),
      setServices
    );

    const unsubBud = loadCollection<Budget>(
      'budget',
      (snap) =>
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Budget, 'id'>)
        })),
      setBudgets
    );

    // Cleanup
    return () => {
      console.log("useEffect -> Desmontando suscripciones...");
      unsubAcc();
      unsubProj();
      unsubServ();
      unsubBud();
    };
  }, [db]);

  /* Métodos de CRUD para budgets */
  const createBudget = async (newBudget: Omit<Budget, 'id'>) => {
    console.log("Intentando crear un nuevo Budget en Firestore:", newBudget);
    try {
      const ref = await addDoc(collection(db, 'budget'), newBudget);
      console.log('Budget creado en Firestore. ID:', ref.id);
    } catch (error) {
      console.error("Error al crear Budget en Firestore. Insertando localmente:", error);
      setBudgets((prev) => [...prev, { ...newBudget, id: 'local-' + Date.now() }]);
    }
  };

  const updateBudget = async (id: string, updated: Partial<Budget>) => {
    console.log(`Intentando actualizar Budget ID: ${id} en Firestore con:`, updated);
    try {
      const ref = doc(db, 'budget', id);
      await updateDoc(ref, updated);
      console.log("Budget actualizado en Firestore.");
    } catch (error) {
      console.error("Error al actualizar Budget en Firestore. Actualizando localmente:", error);
      setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    }
  };

  const deleteBudget = async (id: string) => {
    console.log(`Intentando eliminar Budget ID: ${id} en Firestore...`);
    try {
      const ref = doc(db, 'budget', id);
      await deleteDoc(ref);
      console.log("Budget eliminado en Firestore.");
    } catch (error) {
      console.error("Error al eliminar Budget en Firestore. Eliminando localmente:", error);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  /* Métodos de CRUD para accounts */
  const createAccount = async (newAccount: Account) => {
    console.log("Intentando crear Account en Firestore:", newAccount);
    try {
      const ref = await addDoc(collection(db, 'account'), newAccount);
      console.log('Cuenta creada en Firestore. ID:', ref.id);
    } catch (error) {
      console.error("Error al crear Account en Firestore. Insertando localmente:", error);
      setAccounts((prev) => [...prev, newAccount]);
    }
  };

  const updateAccount = async (id: string, updated: Partial<Account>) => {
    console.log(`Actualizando Account ID: ${id} en Firestore con:`, updated);
    try {
      const ref = doc(db, 'account', id);
      await updateDoc(ref, updated);
      console.log("Cuenta actualizada en Firestore.");
    } catch (error) {
      console.error("Error al actualizar Account en Firestore. Actualizando localmente:", error);
      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === id ? { ...acc, ...updated } : acc))
      );
    }
  };

  const deleteAccount = async (id: string) => {
    console.log(`Eliminando Account ID: ${id} en Firestore...`);
    try {
      const ref = doc(db, 'account', id);
      await deleteDoc(ref);
      console.log("Cuenta eliminada en Firestore.");
    } catch (error) {
      console.error("Error al eliminar Account en Firestore. Eliminando localmente:", error);
      setAccounts((prev) => prev.filter((acc) => acc.accountId !== id));
    }
  };

  /* Métodos de CRUD para projects */
  const createProject = async (newProject: Omit<Project, 'projectId'>) => {
    console.log("Intentando crear Project en Firestore:", newProject);
    try {
      const ref = await addDoc(collection(db, 'project'), newProject);
      console.log('Proyecto creado en Firestore. ID:', ref.id);
    } catch (error) {
      console.error("Error al crear Project en Firestore. Insertando localmente:", error);
      setProjects((prev) => [
        ...prev,
        { ...newProject, projectId: 'local-' + Date.now() }
      ]);
    }
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    console.log(`Actualizando Project ID: ${id} con:`, updated);
    try {
      const ref = doc(db, 'project', id);
      await updateDoc(ref, updated);
      console.log("Proyecto actualizado en Firestore.");
    } catch (error) {
      console.error("Error al actualizar Project en Firestore. Actualizando localmente:", error);
      setProjects((prev) =>
        prev.map((proj) => (proj.projectId === id ? { ...proj, ...updated } : proj))
      );
    }
  };

  const deleteProject = async (id: string) => {
    console.log(`Eliminando Project ID: ${id} en Firestore...`);
    try {
      const ref = doc(db, 'project', id);
      await deleteDoc(ref);
      console.log("Proyecto eliminado en Firestore.");
    } catch (error) {
      console.error("Error al eliminar Project en Firestore. Eliminando localmente:", error);
      setProjects((prev) => prev.filter((proj) => proj.projectId !== id));
    }
  };

  /* Métodos de CRUD para services */
  const createService = async (newService: Omit<Service, 'serviceId'>) => {
    console.log("Intentando crear Service en Firestore:", newService);
    try {
      const ref = await addDoc(collection(db, 'service'), newService);
      console.log('Servicio creado en Firestore. ID:', ref.id);
    } catch (error) {
      console.error("Error al crear Service en Firestore. Insertando localmente:", error);
      setServices((prev) => [
        ...prev,
        { ...newService, serviceId: 'local-' + Date.now() }
      ]);
    }
  };

  const updateService = async (id: string, updated: Partial<Service>) => {
    console.log(`Actualizando Service ID: ${id} con:`, updated);
    try {
      const ref = doc(db, 'service', id);
      await updateDoc(ref, updated);
      console.log("Servicio actualizado en Firestore.");
    } catch (error) {
      console.error("Error al actualizar Service en Firestore. Actualizando localmente:", error);
      setServices((prev) =>
        prev.map((serv) => (serv.serviceId === id ? { ...serv, ...updated } : serv))
      );
    }
  };

  const deleteService = async (id: string) => {
    console.log(`Eliminando Service ID: ${id} en Firestore...`);
    try {
      const ref = doc(db, 'service', id);
      await deleteDoc(ref);
      console.log("Servicio eliminado en Firestore.");
    } catch (error) {
      console.error("Error al eliminar Service en Firestore. Eliminando localmente:", error);
      setServices((prev) => prev.filter((serv) => serv.serviceId !== id));
    }
  };

  // Controlar el drawer
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ backgroundColor: '#333' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleMenu}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Presupuesto - Claro
            </Typography>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer variant="persistent" anchor="left" open={isMenuOpen}>
          <Box sx={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
            <IconButton onClick={toggleMenu}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/">
                <ListItemText primary="Presupuestos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/accounts">
                <ListItemText primary="Cuentas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/projects">
                <ListItemText primary="Proyectos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/services">
                <ListItemText primary="Servicios" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: isMenuOpen ? '240px' : '0',
            transition: 'margin 0.3s ease'
          }}
        >
          <Toolbar />
          <Routes>
            <Route
              path="/"
              element={
                <BudgetsPage
                  budgets={budgets}
                  accounts={accounts}
                  projects={projects}
                  services={services}
                  createBudget={createBudget}
                  updateBudget={updateBudget}
                  deleteBudget={deleteBudget}
                />
              }
            />
            <Route
              path="/accounts"
              element={
                <AccountsPage
                  accounts={accounts}
                  createAccount={createAccount}
                  updateAccount={updateAccount}
                  deleteAccount={deleteAccount}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <ProjectsPage
                  projects={projects}
                  accounts={accounts}
                  createProject={createProject}
                  updateProject={updateProject}
                  deleteProject={deleteProject}
                />
              }
            />
            <Route
              path="/services"
              element={
                <ServicesPage
                  services={services}
                  createService={createService}
                  updateService={updateService}
                  deleteService={deleteService}
                />
              }
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
