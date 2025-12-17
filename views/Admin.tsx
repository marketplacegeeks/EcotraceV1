import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Select } from '../components/UI';
import { getAllItems, getLogs, getAllUsers, createUser, deleteUser, getCurrentUser } from '../services/api';
import { AuditLog, BatchType, TraceableItem, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { UserPlus, Trash2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdminView: React.FC = () => {
  const [items, setItems] = useState<TraceableItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: UserRole.OPERATOR });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const loggedInUser = getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, usersData] = await Promise.all([
          getAllItems(),
          getAllUsers(),
        ]);
        setItems(itemsData);
        setUsers(usersData);
        setLogs(getLogs());
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      }
    };
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
        alert("Username and password are required.");
        return;
    }
    setIsCreatingUser(true);
    try {
        await createUser({ username: newUser.username, password: newUser.password, role: newUser.role });
        setNewUser({ username: '', password: '', role: UserRole.OPERATOR });
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers);
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    }
  };


  // Stats Logic
  const inboundTotal = items.filter(i => i.type === BatchType.INBOUND).reduce((acc, curr) => acc + (curr as any).weightKg, 0);
  const fibreTotal = items.filter(i => i.type === BatchType.FIBRE).reduce((acc, curr) => acc + (curr as any).weightKg, 0);
  
  const materialData = items
    .filter(i => i.type === BatchType.SORTED)
    .reduce((acc: any[], curr: any) => {
      const idx = acc.findIndex(a => a.name === curr.material);
      if (idx >= 0) acc[idx].value += curr.weightKg;
      else acc.push({ name: curr.material, value: curr.weightKg });
      return acc;
    }, []);

  const typeDistribution = [
    { name: 'Inbound', value: items.filter(i => i.type === BatchType.INBOUND).length },
    { name: 'Sorted', value: items.filter(i => i.type === BatchType.SORTED).length },
    { name: 'Fibre', value: items.filter(i => i.type === BatchType.FIBRE).length },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-eco-charcoal tracking-tight">Admin Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="text-xs text-blue-600 font-bold uppercase">Total Inbound</div>
          <div className="text-2xl font-bold text-blue-900">{inboundTotal.toFixed(0)} kg</div>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <div className="text-xs text-green-600 font-bold uppercase">Fibre Produced</div>
          <div className="text-2xl font-bold text-green-900">{fibreTotal.toFixed(0)} kg</div>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <div className="text-xs text-purple-600 font-bold uppercase">Efficiency</div>
          <div className="text-2xl font-bold text-purple-900">{(inboundTotal ? (fibreTotal / inboundTotal) * 100 : 0).toFixed(1)}%</div>
        </Card>
        <Card className="bg-gray-50 border-gray-100">
          <div className="text-xs text-gray-600 font-bold uppercase">Total Batches</div>
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Material Breakdown (kg)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={materialData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Production Volume">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={loggedInUser?.id === user.id}
                          className="p-2 text-red-500 rounded-md hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
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


      {/* Audit Logs */}
      <Card title="Recent Activity Logs" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map(log => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 font-medium">{log.userId}</td>
                  <td className="px-4 py-3"><Badge>{log.action}</Badge></td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={log.details}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};