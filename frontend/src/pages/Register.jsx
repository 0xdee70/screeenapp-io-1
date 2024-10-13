import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input, Button } from '@nextui-org/react';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaMicrosoft, FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSSORegister = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.toLowerCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
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
      await register(name, email, password);
      toast.success('Registration successful. Please log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-0 items-center justify-center py-20 min-h-screen">

      <div className="w-full p-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  classNames={{
                    input: [
                      "bg-transparent",
                      "text-black",
                      "placeholder:text-default-700/50 dark:placeholder:text-white/60",

                      "px-3",
                      "py-2",

                    ],
                    innerWrapper: "bg-transparent",

                  }}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{
                    input: [
                      "bg-transparent",
                      "text-black/90 dark:text-white/90",
                      "placeholder:text-default-700/50 dark:placeholder:text-white/60",

                      "px-3",
                      "py-2",

                    ],
                    innerWrapper: "bg-transparent",

                  }}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endContent={
                    <div className="cursor-pointer" onClick={toggleVisibility}>
                      {isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  }

                  classNames={{
                    input: [
                      "bg-transparent",
                      "text-black/90 dark:text-white/90",
                      "placeholder:text-default-700/50 dark:placeholder:text-white/60",

                      "px-3",
                      "py-2",

                    ],
                    innerWrapper: "bg-transparent",

                  }}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type={isVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  endContent={
                    <div className="cursor-pointer" onClick={toggleVisibility}>
                      {isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  }
                  classNames={{
                    input: [
                      "bg-transparent",
                      "text-black/90 dark:text-white/90",
                      "placeholder:text-default-700/50 dark:placeholder:text-white/60",

                      "px-3",
                      "py-2",

                    ],
                    innerWrapper: "bg-transparent",

                  }}
                />
              </div>
              <Button type="submit" color="primary" className="w-full text-white" disabled={isLoading}>
                {isLoading ? "Registering..." : "Sign Up"}
              </Button>
            </form>

            <div className="flex items-center justify-center space-x-4 my-4">
              <div className="h-[1px] w-full bg-gray-300" />
              <span className="text-muted-foreground">or</span>
              <div className="h-[1px] w-full bg-gray-300" />
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-transparent text-black hover:bg-transparent border border-gray-300"
                startContent={<FaGithub className="text-xl" />}
                onClick={() => handleSSORegister("github")}
              >
                Continue with GitHub
              </Button>
              <Button
                className="w-full bg-transparent text-black hover:bg-transparent border border-gray-300"
                startContent={<FcGoogle className="text-xl" />}
                onClick={() => handleSSORegister("google")}
              >
                Continue with Google
              </Button>
              <Button
                className="w-full bg-transparent text-black hover:bg-transparent border border-gray-300"
                startContent={<FaMicrosoft className="text-xl" />}
                onClick={() => handleSSORegister("microsoft")}
              >
                Continue with Microsoft
              </Button>
            </div>

            <p className="text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                Sign in
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