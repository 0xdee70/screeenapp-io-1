import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogOut, UserCheck, UserX, UserPlus, UserMinus } from 'lucide-react';
import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import TwoFactorSetup from '@/components/2FA';
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

function MasterAdminDashboard() {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionDialog, setActionDialog] = useState({ isOpen: false, action: null, userId: null });
    const [password, setPassword] = useState('');
    const [authCode, setAuthCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchAdmins();
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
            setUsers(data.filter(user => user.role !== 'admin'));
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/admins`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch admins');
            }
            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to fetch admins');
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

    const openActionDialog = (action, userId) => {
        setActionDialog({ isOpen: true, action, userId });
    };

    const closeActionDialog = () => {
        setActionDialog({ isOpen: false, action: null, userId: null });
        setPassword('');
        setAuthCode('');
    };

    const handleAction = async () => {
        try {
            let response;
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            };
            const body = JSON.stringify({ password, authCode });

            switch (actionDialog.action) {
                case 'toggleAccess':
                    response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/toggle-access/${actionDialog.userId}`, {
                        method: 'POST',
                        headers,
                        body
                    });
                    break;
                case 'promote':
                    response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promote/${actionDialog.userId}`, {
                        method: 'POST',
                        headers,
                        body
                    });
                    break;
                case 'demote':
                    response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/demote/${actionDialog.userId}`, {
                        method: 'POST',
                        headers,
                        body
                    });
                    break;
                case 'toggle2FA':
                    response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/toggle-2fa/${actionDialog.userId}`, {
                        method: 'POST',
                        headers,
                        body
                    });
                    break;
                default:
                    throw new Error('Invalid action');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Action failed');
            }

            const result = await response.json();
            toast.success(result.message);
            fetchUsers();
            fetchAdmins();
            closeActionDialog();
        } catch (error) {
            console.error('Error performing action:', error);
            toast.error(error.message || 'Action failed');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Master Admin Dashboard</CardTitle>
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
                                                onClick={() => openActionDialog('toggleAccess', user._id)}
                                                className={cn(user.isActive ? colors.warning : colors.success, "mr-2")}
                                                disabled={user.role === 'master_admin'}
                                            >
                                                {user.isActive ? (
                                                    <><UserX className="mr-2 h-4 w-4" /> Disable Access</>
                                                ) : (
                                                    <><UserCheck className="mr-2 h-4 w-4" /> Enable Access</>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => openActionDialog('promote', user._id)}
                                                className={cn(colors.success)}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" /> Promote to Admin
                                            </Button>
                                            <Switch
                                                checked={user.twoFactorEnabled}
                                                onCheckedChange={() => openActionDialog('toggle2FA', user._id)}
                                                disabled={user.role === 'master_admin'}
                                            />
                                            <span className="ml-2">2FA {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    <h2 className="text-xl font-semibold mt-8 mb-4">Admin Management</h2>
                    {isLoading ? (
                        <p>Loading admins...</p>
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
                                {admins.map((admin) => (
                                    <TableRow key={admin._id}>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                        <TableCell>{admin.isActive ? 'Active' : 'Inactive'}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => openActionDialog('demote', admin._id)}
                                                className={cn(colors.danger)}
                                                disabled={admin.role === 'master_admin'}
                                            >
                                                <UserMinus className="mr-2 h-4 w-4" /> Demote to User
                                            </Button>
                                            <Switch
                                                checked={admin.twoFactorEnabled}
                                                onCheckedChange={() => openActionDialog('toggle2FA', admin._id)}
                                                disabled={admin.role === 'master_admin'}
                                            />
                                            <span className="ml-2">2FA {admin.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <TwoFactorSetup />
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <AlertDialog open={actionDialog.isOpen} onOpenChange={closeActionDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="text"
                            placeholder="Enter 2FA code (if enabled)"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <Button onClick={closeActionDialog} className={cn(colors.secondary)}>Cancel</Button>
                        <Button onClick={handleAction} className={cn(colors.primary)}>Confirm</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default MasterAdminDashboard;