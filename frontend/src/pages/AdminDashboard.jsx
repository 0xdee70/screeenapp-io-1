import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogOut, UserCheck, UserX } from 'lucide-react';
import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    setTimeout(() => navigate('/login'), 2000);
  };

  const handleToggleAccess = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/toggle-access/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to toggle user access');
      }
      const { isActive } = await response.json();
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActive } : user
      ));
      toast.success(`User access ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling user access:', error);
      toast.error('Failed to toggle user access');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          <Button onClick={handleLogout} className={cn(colors.danger)}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleToggleAccess(user._id, user.isActive)}
                        className={cn(user.isActive ? colors.warning : colors.success)}
                        disabled={user.role === 'admin' || user.role === 'master_admin'}
                      >
                        {user.isActive ? (
                          <><UserX className="mr-2 h-4 w-4" /> Disable Access</>
                        ) : (
                          <><UserCheck className="mr-2 h-4 w-4" /> Enable Access</>
                        )}
                      </Button>
                      <Button
                        onClick={() => openActionDialog('toggle2FA', user._id)}
                        className={cn(colors.info)}
                        disabled={user.role !== 'user'}
                      >
                        <Shield className="mr-2 h-4 w-4" /> Toggle 2FA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}

export default AdminDashboard;