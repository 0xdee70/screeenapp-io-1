import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaMicrosoft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { register } from '@/components/AuthService';

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const validatePassword = (password) => {
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[A-Za-z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSSORegister = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.toLowerCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      toast.error('Please provide all details');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please provide a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters long and contain letters, numbers, and special characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password);
      toast.success('Registration successful. Please log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirects after 2 seconds to show the success message
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row container mx-auto px-4 py-12">
      <div className="w-full md:w-1/2 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome to ScreenCast Pro</h1>
        <p className="mb-4 text-center">
          Join us today and experience the best of our services. Create an account to get started on your journey with us.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li className="text-center">✓ Access to exclusive features</li>
          <li className="text-center">✓ Personalized dashboard</li>
          <li className="text-center">✓ Connect with like-minded individuals</li>
          <li className="text-center">✓ 24/7 customer support</li>
        </ul>
      </div>
      <div className="w-full md:w-1/2 p-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white transition duration-300" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>

            <div className="flex items-center justify-center space-x-4 my-4">
              <div className="h-[1px] w-full bg-gray-300" />
              <span className="text-muted-foreground">or</span>
              <div className="h-[1px] w-full bg-gray-300" />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => handleSSORegister("google")}>
                <div className="flex items-center justify-center">
                  <FcGoogle className="inline-block mr-2 h-5 w-5" />
                  Sign in with Google
                </div>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSSORegister("github")}>
                <div className="flex items-center justify-center">
                  <FaGithub className="inline-block mr-2 h-5 w-5" />
                  Sign in with GitHub
                </div>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSSORegister("microsoft")}>
                <div className="flex items-center justify-center">
                  <FaMicrosoft className="inline-block mr-2 h-5 w-5" />
                  Sign in with Microsoft
                </div>
              </Button>
            </div>

            <p className="text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 font-semibold">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <ToastContainer />
    </div>
  );
};

export default RegisterPage;
