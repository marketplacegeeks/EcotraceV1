import React, 'react';
import { Card, Badge, Button, Input, Select } from '../components/UI';
import { getAllUsers, createUser, deleteUser, getCurrentUser, updateUser } from '../services/api';
import { User, UserRole } from '../types';
import { UserPlus, Trash2, Edit } from 'lucide-react';

const EditUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, data: { username: string, password?: string }) => Promise<void>;
    user: User | null;
}> = ({ isOpen, onClose, onSave, user }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && user) {
            setUsername(user.username);
            setPassword('');
            setLoading(false);
        }
    }, [isOpen, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !username.trim()) return;
        setLoading(true);
        try {
            await onSave(user.id, {
                username: username.trim(),
                password: password.trim() ? password.trim() : undefined
            });
            onClose();
        } catch (err) {
            setLoading(false); // Let parent handle error display
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h3 className="text-xl font-bold text-eco-charcoal tracking-tight mb-2">Edit User</h3>
                    <p className="text-gray-500 mb-6">Update username or reset password for <span className="font-bold">{user.username}</span>.</p>
                    <Input
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoFocus
                        required
                    />
                    <Input
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


export const AdminView: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [newUser, setNewUser] = React.useState({ username: '', password: '', role: UserRole.OPERATOR });
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState('');
  
  const loggedInUser = getCurrentUser();

  const fetchUsers = React.useCallback(async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setError("Could not load users.");
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
        setError("Username and password are required.");
        return;
    }
    setError('');
    setIsCreatingUser(true);
    try {
        await createUser({ username: newUser.username, password: newUser.password, role: newUser.role });
        setNewUser({ username: '', password: '', role: UserRole.OPERATOR });
        await fetchUsers();
    } catch (error: any) {
        setError(`Error: ${error.message}`);
    } finally {
        setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        setError('');
        try {
            await deleteUser(userId);
            await fetchUsers();
        } catch (error: any) {
            setError(`Error: ${error.message}`);
        }
    }
  };

  const handleUpdateUser = async (userId: string, data: { username: string, password?: string }) => {
    setError('');
    try {
      await updateUser(userId, data);
      await fetchUsers();
    } catch (error: any) {
      setError(`Error: ${error.message}`);
      throw error; // Re-throw to keep modal loading indicator spinning
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-eco-charcoal tracking-tight">Administration</h2>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in" role="alert">
            {error}
        </div>
      )}

      {/* User Management Section */}
      <div className="grid md:grid-cols-5 gap-6 items-start">
        <div className="md:col-span-3">
          <Card title="User Management" action={<Badge>{users.length} Users</Badge>}>
            <div className="overflow-x-auto -mx-6 -mb-8 md:-mx-8">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-eco-charcoal">{user.username}</td>
                      <td className="px-6 py-4">
                        <Badge color={user.role === UserRole.ADMIN ? 'bg-eco-orange/10 text-eco-orange border-eco-orange/20' : 'bg-gray-100 text-gray-700'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-gray-500 rounded-md hover:bg-blue-50 hover:text-blue-600 disabled:text-gray-300 transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={loggedInUser?.id === user.id}
                          className="p-2 text-gray-500 rounded-md hover:bg-red-50 hover:text-red-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                          title={loggedInUser?.id === user.id ? "Cannot delete yourself" : "Delete User"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="md:col-span-2">
           <Card title="Create New User" action={<UserPlus size={20} className="text-gray-300"/>}>
              <form onSubmit={handleCreateUser}>
                 <Input
                   label="Username"
                   placeholder="e.g. new_operator"
                   value={newUser.username}
                   onChange={e => setNewUser({...newUser, username: e.target.value})}
                   required
                 />
                 <Input
                   label="Password"
                   type="password"
                   placeholder="••••••••"
                   value={newUser.password}
                   onChange={e => setNewUser({...newUser, password: e.target.value})}
                   required
                 />
                 <Select
                   label="User Role"
                   value={newUser.role}
                   onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                 >
                   <option value={UserRole.OPERATOR}>Operator</option>
                   <option value={UserRole.ADMIN}>Admin</option>
                 </Select>
                 <div className="mt-2">
                   <Button type="submit" isLoading={isCreatingUser} variant="secondary">
                     Create User
                   </Button>
                 </div>
              </form>
           </Card>
        </div>
      </div>

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        user={editingUser}
      />
    </div>
  );
};