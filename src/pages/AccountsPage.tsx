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

interface Account {
  accountId: string;
  name: string;
}

interface AccountsPageProps {
  accounts: Account[];
  createAccount: (newAccount: Account) => void;
  updateAccount: (id: string, updated: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
}

const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  createAccount,
  updateAccount,
  deleteAccount
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newAccount, setNewAccount] = useState({ accountId: '', name: '' });
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setNewAccount({ accountId: '', name: '' });
    setOpenCreate(true);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false);
  };
  const handleOpenEdit = (account: Account) => {
    setCurrentAccount(account);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentAccount) {
      setCurrentAccount({ ...currentAccount, [name]: value });
    } else {
      setNewAccount({ ...newAccount, [name]: value });
    }
  };
  const handleCreateAccount = () => {
    createAccount(newAccount);
    handleCloseCreate();
  };
  const handleUpdateAccount = () => {
    if (currentAccount) {
      updateAccount(currentAccount.accountId, currentAccount);
      handleCloseEdit();
    }
  };
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('¿Eliminar esta cuenta?')) {
      deleteAccount(id);
    }
  };

  const filteredAccounts = accounts.filter(a =>
    a.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Cuentas</h1>
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
          Crear Cuenta
        </Button>
      </Toolbar>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table className="minimal-table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>ID de la Cuenta</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell style={{ width: '120px' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.map((acc, idx) => (
              <TableRow key={acc.accountId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{acc.accountId}</TableCell>
                <TableCell>{acc.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEdit(acc)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteAccount(acc.accountId)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Cuenta</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="ID de la Cuenta"
            name="accountId"
            value={newAccount.accountId}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Nombre"
            name="name"
            value={newAccount.name}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseCreate}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateAccount}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Cuenta</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="ID de la Cuenta"
            name="accountId"
            value={currentAccount?.accountId || ''}
            onChange={handleChange}
            fullWidth
            disabled
          />
          <TextField
            label="Nombre"
            name="name"
            value={currentAccount?.name || ''}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateAccount}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccountsPage;