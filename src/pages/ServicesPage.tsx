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
  Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Service {
  serviceId: string;
  name: string;
}
interface ServicesPageProps {
  services: Service[];
  createService: (newService: Omit<Service, 'serviceId'>) => void;
  updateService: (id: string, updated: Partial<Service>) => void;
  deleteService: (id: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  createService,
  updateService,
  deleteService
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newService, setNewService] = useState({ name: '' });
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setNewService({ name: '' });
    setOpenCreate(true);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false);
  };
  const handleOpenEdit = (service: Service) => {
    setCurrentService(service);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentService) {
      setCurrentService({ ...currentService, [name]: value });
    } else {
      setNewService({ ...newService, [name]: value });
    }
  };
  const handleCreateService = () => {
    createService(newService);
    handleCloseCreate();
  };
  const handleUpdateService = () => {
    if (currentService) {
      updateService(currentService.serviceId, currentService);
      handleCloseEdit();
    }
  };
  const handleDeleteService = (id: string) => {
    if (window.confirm('¿Eliminar este servicio?')) {
      deleteService(id);
    }
  };

  const filteredServices = services.filter(s =>
    s.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Servicios</h1>
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
          Crear Servicio
        </Button>
      </Toolbar>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table className="minimal-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>ID del Servicio</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell style={{ width: '120px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((serv, idx) => (
              <TableRow key={serv.serviceId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{serv.serviceId}</TableCell>
                <TableCell>{serv.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEdit(serv)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteService(serv.serviceId)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Servicio</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="Nombre del Servicio"
            name="name"
            value={newService.name}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseCreate}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateService}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Servicio</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="ID del Servicio"
            name="serviceId"
            value={currentService?.serviceId || ''}
            onChange={handleChange}
            fullWidth
            disabled
          />
          <TextField
            label="Nombre del Servicio"
            name="name"
            value={currentService?.name || ''}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateService}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServicesPage;