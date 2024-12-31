import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,  
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Project {
  projectId: string;
  accountId: string;
  name: string;
}
interface Account {
  accountId: string;
  name: string;
}
interface ProjectsPageProps {
  projects: Project[];
  accounts: Account[];
  createProject: (newProject: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  accounts,
  createProject,
  updateProject,
  deleteProject
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newProject, setNewProject] = useState({ projectId: '', accountId: '', name: '' });
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setNewProject({ projectId: '', accountId: '', name: '' });
    setOpenCreate(true);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false);
  };
  const handleOpenEdit = (project: Project) => {
    setCurrentProject(project);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    if (currentProject) {
      setCurrentProject({ ...currentProject, [name as string]: value as string });
    } else {
      setNewProject({ ...newProject, [name as string]: value as string });
    }
  };
  const handleCreateProject = () => {
    createProject(newProject);
    handleCloseCreate();
  };
  const handleUpdateProject = () => {
    if (currentProject) {
      updateProject(currentProject.projectId, currentProject);
      handleCloseEdit();
    }
  };
  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Eliminar este proyecto?')) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Proyectos</h1>
      <Toolbar disableGutters sx={{ paddingLeft: 0 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: 1 }} />
          }}
          sx={{ marginRight: 2 }}
        />
        <Button variant="contained" onClick={handleOpenCreate}>
          Crear Proyecto
        </Button>
      </Toolbar>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table className="minimal-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>ID del Proyecto</TableCell>
              <TableCell>ID de la Cuenta</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell style={{ width: '120px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((proj, idx) => (
              <TableRow key={proj.projectId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{proj.projectId}</TableCell>
                <TableCell>{proj.accountId}</TableCell>
                <TableCell>{proj.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEdit(proj)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProject(proj.projectId)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Proyecto</DialogTitle>
        <DialogContent className="dialog-content">
          <FormControl fullWidth>
            <InputLabel id="select-account-label">Cuenta</InputLabel>
            <Select
              labelId="select-account-label"
              name="accountId"
              value={newProject.accountId}
              onChange={handleChange}
              label="Cuenta"
            >
              {accounts.map(acc => (
                <MenuItem key={acc.accountId} value={acc.accountId}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="ID del Proyecto"
            name="projectId"
            value={newProject.projectId}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Nombre del Proyecto"
            name="name"
            value={newProject.name}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseCreate}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Proyecto</DialogTitle>
        <DialogContent className="dialog-content">
          <FormControl fullWidth>
            <InputLabel id="select-account-label">Cuenta</InputLabel>
            <Select
              labelId="select-account-label"
              name="accountId"
              value={currentProject?.accountId || ''}
              onChange={handleChange}
              label="Cuenta"
            >
              {accounts.map(acc => (
                <MenuItem key={acc.accountId} value={acc.accountId}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="ID del Proyecto"
            name="projectId"
            value={currentProject?.projectId || ''}
            onChange={handleChange}
            fullWidth
            disabled
          />
          <TextField
            label="Nombre del Proyecto"
            name="name"
            value={currentProject?.name || ''}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateProject}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;