// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Card, CardHeader, CardFooter, CardContent, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { FcGoogle } from 'react-icons/fc';
// import { FaGithub, FaMicrosoft } from 'react-icons/fa';
// import { login } from '@/components/AuthService';

// const validateEmail = (email) => {
//   const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   return re.test(email);
// };

// const validatePassword = (password) => {
//   return password.length >= 8 && /\d/.test(password) && /[A-Za-z]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
// };

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSSOLogin = (provider) => {
//     window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.toLowerCase()}`;
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');
//     const role = params.get('role');
//     const error = params.get('error');

//     if (token && role) {
//       localStorage.setItem('accessToken', token);
//       localStorage.setItem('role', role);
//       navigate(role === 'admin' ? '/admin' : '/screen');
//     } else if (error) {
//       toast.error(decodeURIComponent(error));
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (!email || !password) {
//       toast.error('Please provide all details');
//       setIsLoading(false);
//       return;
//     }

//     if (!validateEmail(email)) {
//       toast.error('Please provide a valid email address');
//       setIsLoading(false);
//       return;
//     }

//     if (!validatePassword(password)) {
//       toast.error('Password must be at least 8 characters long and contain letters, numbers, and special characters');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { token, role } = await login(email, password);
//       localStorage.setItem('accessToken', token);
//       localStorage.setItem('role', role);

//       toast.success('Login successful!');
//       navigate(role === 'admin' ? '/admin' : '/screen');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="auto flex items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
//         <div className="md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center">
//           <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
//           <p className="text-white text-lg">Log in to access your account and continue your journey with us.</p>
//         </div>
//         <div className="md:w-1/2 p-8">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold text-center">Login to Your Account</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div className="space-y-1">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? 'Logging in...' : 'Login'}
//               </Button>
//             </form>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <Separator className="w-full" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-2 text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//               <Button onClick={() => handleSSOLogin('Google')} variant="outline" className="w-full">
//                 <FcGoogle className="h-5 w-5" />
//               </Button>
//               <Button onClick={() => handleSSOLogin('Github')} variant="outline" className="w-full">
//                 <FaGithub className="h-5 w-5" />
//               </Button>
//               <Button onClick={() => handleSSOLogin('Microsoft')} variant="outline" className="w-full">
//                 <FaMicrosoft className="h-5 w-5" />
//               </Button>
//             </div>
//           </CardContent>
//           <CardFooter className="justify-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <a href="/register" className="text-blue-500 hover:underline font-semibold">
//                 Register here
//               </a>
//             </p>
//           </CardFooter>
//         </div>
//       </Card>
//       <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardFooter, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaMicrosoft } from 'react-icons/fa';
import { login } from '@/components/AuthService';

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && /\d/.test(password) && /[A-Za-z]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSSOLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.toLowerCase()}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');
    const error = params.get('error');

    if (token && role) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', role);
      navigate(role === 'admin' ? '/admin' : '/screen');
    } else if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
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

    try {
      const { token, role } = await login(email, password);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', role);

      toast.success('Login successful!');
      navigate(role === 'admin' ? '/admin' : '/screen');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row container mx-auto px-4 py-12">
      {/* Left Section */}
      <div className="md:w-1/2 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome Back</h2>
        <p className="text-center mb-4">
          Log in to access your account and continue your journey with us.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li className="text-center">✓ Easy access to your dashboard</li>
          <li className="text-center">✓ View your past recordings</li>
          <li className="text-center">✓ Get personalized recommendations</li>
          <li className="text-center">✓ 24/7 support</li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 p-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login to Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => handleSSOLogin('Google')} variant="outline" className="w-full">
                <FcGoogle className="h-5 w-5" />
              </Button>
              <Button onClick={() => handleSSOLogin('Github')} variant="outline" className="w-full">
                <FaGithub className="h-5 w-5" />
              </Button>
              <Button onClick={() => handleSSOLogin('Microsoft')} variant="outline" className="w-full">
                <FaMicrosoft className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline font-semibold">
                Register here
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default Login;
