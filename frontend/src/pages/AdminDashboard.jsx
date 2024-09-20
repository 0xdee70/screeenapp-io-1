import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useAuthProtection } from "@/components/Auth";

const AdminDashboard = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    // Add more mock users as needed
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // const isAuthorized = useAuthProtection('admin');

  // if (!isAuthorized) {
  //   return <div>Loading...</div>;
  // }

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setMessage("");
  };

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword) {
      setMessage("Please select a user and enter a new password.");
      return;
    }

    // Here you would typically make an API call to change the password
    // For this example, we'll just show a success message
    setMessage(`Password changed successfully for ${selectedUser.name}`);
    setNewPassword("");
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleSelectUser(user)}>Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedUser && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Change Password for {selectedUser.name}</h3>
              <div className="flex space-x-4">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button onClick={handleChangePassword}>Change Password</Button>
              </div>
            </div>
          )}

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;