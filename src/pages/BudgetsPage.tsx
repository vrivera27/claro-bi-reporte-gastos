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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
  Box,
  Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SearchIcon from '@mui/icons-material/Search';

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
interface BudgetsPageProps {
  budgets: Budget[];
  accounts: Account[];
  projects: Project[];
  services: Service[];
  createBudget: (newBudget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updated: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

const AVAILABLE_MONTHS = [
  { name: 'Enero', value: '01' },
  { name: 'Febrero', value: '02' },
  { name: 'Marzo', value: '03' },
  { name: 'Abril', value: '04' },
  { name: 'Mayo', value: '05' },
  { name: 'Junio', value: '06' },
  { name: 'Julio', value: '07' },
  { name: 'Agosto', value: '08' },
  { name: 'Septiembre', value: '09' },
  { name: 'Octubre', value: '10' },
  { name: 'Noviembre', value: '11' },
  { name: 'Diciembre', value: '12' }
];

const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  accounts,
  projects,
  services,
  createBudget,
  updateBudget,
  deleteBudget
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [budgetEntries, setBudgetEntries] = useState<{ months: string[]; budget: number }[]>([
    { months: [], budget: 0 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setSelectedAccount('');
    setSelectedProject('');
    setSelectedService('');
    setBudgetEntries([{ months: [], budget: 0 }]);
    setOpenCreate(true);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false);
  };
  const handleCreateBudget = () => {
    budgetEntries.forEach(entry => {
      createBudget({
        account: selectedAccount,
        project: selectedProject,
        service: selectedService,
        month: entry.months,
        budget: entry.budget
      });
    });
    handleCloseCreate();
  };
  const handleOpenEdit = (budget: Budget) => {
    setSelectedAccount(budget.account);
    setSelectedProject(budget.project);
    setSelectedService(budget.service);
    setBudgetEntries([{ months: budget.month, budget: budget.budget }]);
    setEditBudgetId(budget.id);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditBudgetId(null);
  };
  const handleEditBudget = () => {
    if (editBudgetId) {
      budgetEntries.forEach(entry => {
        updateBudget(editBudgetId, {
          account: selectedAccount,
          project: selectedProject,
          service: selectedService,
          month: entry.months,
          budget: entry.budget
        });
      });
      handleCloseEdit();
    }
  };
  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este presupuesto?')) {
      deleteBudget(id);
    }
  };

  const addBudgetEntry = () => {
    setBudgetEntries(prev => [...prev, { months: [], budget: 0 }]);
  };
  const removeBudgetEntry = (index: number) => {
    setBudgetEntries(prev => prev.filter((_, i) => i !== index));
  };
  const handleBudgetEntryChange = (index: number, field: string, value: any) => {
    const newEntries = [...budgetEntries];
    if (field === 'budget') {
      newEntries[index].budget = value;
    }
    setBudgetEntries(newEntries);
  };
  const filteredProjects = projects.filter(p => p.accountId === selectedAccount);
  const filteredServices = services;
  const toggleMonth = (index: number, month: string) => {
    const newEntries = [...budgetEntries];
    const entry = newEntries[index];
    if (entry.months.includes(month)) {
      entry.months = entry.months.filter(m => m !== month);
    } else {
      entry.months.push(month);
    }
    setBudgetEntries(newEntries);
  };
  const getAvailableMonths = (index: number) => {
    // Quitar restricciones si deseas permitir que varios BudgetEntries
    // tengan el mismo mes; en este ejemplo se impide duplicar meses en distinto entry
    const selectedAll = budgetEntries.flatMap(e => e.months);
    return AVAILABLE_MONTHS.filter(
      m => !selectedAll.includes(m.value) || budgetEntries[index].months.includes(m.value)
    );
  };

  const monthToText = (arr: string[]) =>
    arr
      .map(m => {
        const found = AVAILABLE_MONTHS.find(x => x.value === m);
        return found ? found.name : m;
      })
      .join(', ');

  const handleSearch = (b: Budget) => {
    const monthText = monthToText(b.month).toLowerCase();
    return (
      b.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monthText.includes(searchTerm.toLowerCase()) ||
      String(b.budget).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredBudgets = budgets.filter(handleSearch);

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Presupuestos</h1>
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
          Crear Presupuesto
        </Button>
      </Toolbar>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table className="minimal-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Cuenta</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Meses</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell style={{ width: '120px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBudgets.map((b, index) => (
              <TableRow key={b.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{b.account}</TableCell>
                <TableCell>{b.project}</TableCell>
                <TableCell>{b.service}</TableCell>
                <TableCell>{monthToText(b.month)}</TableCell>
                <TableCell>{b.budget}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenEdit(b)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(b.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Presupuesto</DialogTitle>
        <DialogContent className="dialog-content">
          <FormControl fullWidth>
            <InputLabel id="select-account">Cuenta</InputLabel>
            <Select
              labelId="select-account"
              value={selectedAccount}
              label="Cuenta"
              onChange={e => setSelectedAccount(e.target.value)}
            >
              {accounts.map(acc => (
                <MenuItem key={acc.accountId} value={acc.accountId}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-project">Proyecto</InputLabel>
            <Select
              labelId="select-project"
              value={selectedProject}
              label="Proyecto"
              onChange={e => setSelectedProject(e.target.value)}
              disabled={!selectedAccount}
            >
              {filteredProjects.map(proj => (
                <MenuItem key={proj.projectId} value={proj.projectId}>
                  {proj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-service">Servicio</InputLabel>
            <Select
              labelId="select-service"
              value={selectedService}
              label="Servicio"
              onChange={e => setSelectedService(e.target.value)}
            >
              {filteredServices.map(serv => (
                <MenuItem key={serv.serviceId} value={serv.serviceId}>
                  {serv.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {budgetEntries.map((entry, index) => (
            <Paper
              key={index}
              sx={{
                padding: 2,
                marginTop: 2,
                position: 'relative',
                backgroundColor: '#f9f9f9'
              }}
              elevation={0}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <strong>Presupuesto #{index + 1}</strong>
                {index > 0 && (
                  <IconButton color="error" onClick={() => removeBudgetEntry(index)}>
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ marginTop: 2 }}>
                {getAvailableMonths(index).map(m => (
                  <FormControlLabel
                    key={m.value}
                    control={
                      <Checkbox
                        checked={entry.months.includes(m.value)}
                        onChange={() => toggleMonth(index, m.value)}
                      />
                    }
                    label={m.name}
                  />
                ))}
              </Box>
              <TextField
                label="Budget"
                type="number"
                value={entry.budget}
                onChange={e =>
                  handleBudgetEntryChange(index, 'budget', parseFloat(e.target.value) || 0)
                }
                fullWidth
                sx={{ marginTop: 2 }}
              />
            </Paper>
          ))}
          <Button
            variant="outlined"
            sx={{ marginTop: 2 }}
            onClick={addBudgetEntry}
            disabled={
              budgetEntries[budgetEntries.length - 1].budget === 0 ||
              budgetEntries[budgetEntries.length - 1].months.length === 0
            }
          >
            Agregar otro Presupuesto
          </Button>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseCreate}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateBudget}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Presupuesto</DialogTitle>
        <DialogContent className="dialog-content">
          <FormControl fullWidth>
            <InputLabel id="edit-account">Cuenta</InputLabel>
            <Select
              labelId="edit-account"
              value={selectedAccount}
              label="Cuenta"
              onChange={e => setSelectedAccount(e.target.value)}
            >
              {accounts.map(acc => (
                <MenuItem key={acc.accountId} value={acc.accountId}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-project">Proyecto</InputLabel>
            <Select
              labelId="edit-project"
              value={selectedProject}
              label="Proyecto"
              onChange={e => setSelectedProject(e.target.value)}
              disabled={!selectedAccount}
            >
              {filteredProjects.map(proj => (
                <MenuItem key={proj.projectId} value={proj.projectId}>
                  {proj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="edit-service">Servicio</InputLabel>
            <Select
              labelId="edit-service"
              value={selectedService}
              label="Servicio"
              onChange={e => setSelectedService(e.target.value)}
            >
              {filteredServices.map(serv => (
                <MenuItem key={serv.serviceId} value={serv.serviceId}>
                  {serv.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {budgetEntries.map((entry, index) => (
            <Paper
              key={index}
              sx={{
                padding: 2,
                marginTop: 2,
                position: 'relative',
                backgroundColor: '#f9f9f9'
              }}
              elevation={0}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <strong>Presupuesto #{index + 1}</strong>
                {index > 0 && (
                  <IconButton color="error" onClick={() => removeBudgetEntry(index)}>
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ marginTop: 2 }}>
                {getAvailableMonths(index).map(m => (
                  <FormControlLabel
                    key={m.value}
                    control={
                      <Checkbox
                        checked={entry.months.includes(m.value)}
                        onChange={() => toggleMonth(index, m.value)}
                      />
                    }
                    label={m.name}
                  />
                ))}
              </Box>
              <TextField
                label="Budget"
                type="number"
                value={entry.budget}
                onChange={e =>
                  handleBudgetEntryChange(index, 'budget', parseFloat(e.target.value) || 0)
                }
                fullWidth
                sx={{ marginTop: 2 }}
              />
            </Paper>
          ))}
          <Button
            variant="outlined"
            sx={{ marginTop: 2 }}
            onClick={addBudgetEntry}
            disabled={
              budgetEntries[budgetEntries.length - 1].budget === 0 ||
              budgetEntries[budgetEntries.length - 1].months.length === 0
            }
          >
            Agregar otro Presupuesto
          </Button>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditBudget}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BudgetsPage;