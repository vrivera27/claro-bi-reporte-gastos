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
  QuerySnapshot,
  getDocs
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
import LoginPage from './pages/LoginPage';
import './App.css';
import { BigQuery } from '@google-cloud/bigquery';

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

async function pushAllBudgetsToBigQuery(allBudgets: Budget[]) {
  console.log('* Iniciando push de Budgets a BigQuery. Total:', allBudgets.length);
  try {
    const response = await fetch('https://us-central1-claro-consumo-grafana-d.cloudfunctions.net/pushAllBudgetsToBigQuery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(allBudgets)
    });
    if (response.ok) {
      console.log('* Finalizado push de Budgets a BigQuery.');
    } else {
      console.error('* Error durante el push a BigQuery:', await response.text());
    }
  } catch (error) {
    console.error('* Error durante el push a BigQuery:', error);
  }
}

function App() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  /*
  const isAuthenticated = !!window.localStorage.getItem('authUser');
  const storedUser = window.localStorage.getItem('authUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  */

  const loadCollection = <T,>(
    collName: string,
    transform: (snap: QuerySnapshot<DocumentData>) => T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const unsub = onSnapshot(
      collection(db, collName),
      (snap) => {
        const data = transform(snap);
        setter(data);
      },
      () => {}
    );
    return unsub;
  };

  useEffect(() => {
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

    return () => {
      unsubAcc();
      unsubProj();
      unsubServ();
      unsubBud();
    };
  }, [db]);

  const createBudget = async (newBudget: Omit<Budget, 'id'>) => {
    try {
      console.log('* Creando nuevo Budget en Firestore:', newBudget);
      await addDoc(collection(db, 'budget'), newBudget);
      console.log('* Obteniendo todos los Budgets de Firestore...');
      const querySnapshot = await getDocs(collection(db, 'budget'));
      const allBudgets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      console.log('* Push de todos los Budgets a BigQuery...');
      await pushAllBudgetsToBigQuery(allBudgets);
    } catch (error) {
      console.error('* Error al crear Budget:', error);
      setBudgets((prev) => [...prev, { ...newBudget, id: 'local-' + Date.now() }]);
    }
  };

  const updateBudget = async (id: string, updated: Partial<Budget>) => {
    try {
      console.log(`* Actualizando Budget ID: ${id} en Firestore con:`, updated);
      const ref = doc(db, 'budget', id);
      await updateDoc(ref, updated);
      console.log('* Obteniendo todos los Budgets de Firestore...');
      const querySnapshot = await getDocs(collection(db, 'budget'));
      const allBudgets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      console.log('* Push de todos los Budgets a BigQuery...');
      await pushAllBudgetsToBigQuery(allBudgets);
    } catch (error) {
      console.error('* Error al actualizar Budget:', error);
      setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      console.log(`* Eliminando Budget ID: ${id} en Firestore...`);
      const ref = doc(db, 'budget', id);
      await deleteDoc(ref);
      console.log('* Obteniendo todos los Budgets de Firestore...');
      const querySnapshot = await getDocs(collection(db, 'budget'));
      const allBudgets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      console.log('* Push de todos los Budgets a BigQuery...');
      await pushAllBudgetsToBigQuery(allBudgets);
    } catch (error) {
      console.error('* Error al eliminar Budget:', error);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const createAccount = async (newAccount: Account) => {
    try {
      await addDoc(collection(db, 'account'), newAccount);
    } catch (error) {
      setAccounts((prev) => [...prev, newAccount]);
    }
  };

  const updateAccount = async (id: string, updated: Partial<Account>) => {
    try {
      const ref = doc(db, 'account', id);
      await updateDoc(ref, updated);
    } catch (error) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === id ? { ...acc, ...updated } : acc))
      );
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const ref = doc(db, 'account', id);
      await deleteDoc(ref);
    } catch (error) {
      setAccounts((prev) => prev.filter((acc) => acc.accountId !== id));
    }
  };

  const createProject = async (newProject: Omit<Project, 'projectId'>) => {
    try {
      await addDoc(collection(db, 'project'), newProject);
    } catch (error) {
      setProjects((prev) => [
        ...prev,
        { ...newProject, projectId: 'local-' + Date.now() }
      ]);
    }
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    try {
      const ref = doc(db, 'project', id);
      await updateDoc(ref, updated);
    } catch (error) {
      setProjects((prev) =>
        prev.map((proj) => (proj.projectId === id ? { ...proj, ...updated } : proj))
      );
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const ref = doc(db, 'project', id);
      await deleteDoc(ref);
    } catch (error) {
      setProjects((prev) => prev.filter((proj) => proj.projectId !== id));
    }
  };

  const createService = async (newService: Omit<Service, 'serviceId'>) => {
    try {
      await addDoc(collection(db, 'service'), newService);
    } catch (error) {
      setServices((prev) => [
        ...prev,
        { ...newService, serviceId: 'local-' + Date.now() }
      ]);
    }
  };

  const updateService = async (id: string, updated: Partial<Service>) => {
    try {
      const ref = doc(db, 'service', id);
      await updateDoc(ref, updated);
    } catch (error) {
      setServices((prev) =>
        prev.map((serv) => (serv.serviceId === id ? { ...serv, ...updated } : serv))
      );
    }
  };

  const deleteService = async (id: string) => {
    try {
      const ref = doc(db, 'service', id);
      await deleteDoc(ref);
    } catch (error) {
      setServices((prev) => prev.filter((serv) => serv.serviceId !== id));
    }
  };

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
            {/*
            {isAuthenticated && (
              <Typography sx={{ marginRight: 2 }}>
                {currentUser?.email ?? 'Sin email'}
              </Typography>
            )}
            */}
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
            {/*
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <BudgetsPage
                    budgets={budgets}
                    accounts={accounts}
                    projects={projects}
                    services={services}
                    createBudget={createBudget}
                    updateBudget={updateBudget}
                    deleteBudget={deleteBudget}
                  />
                ) : (
                  <LoginPage />
                )
              }
            />
            */}
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
