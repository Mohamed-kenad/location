import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.get("https://json-server-api-q84y.onrender.com/users");
      const users = response.data;
      const loggedInUser = users.find((user) => user.email === email && user.password === password);
  
      if (loggedInUser) {
        const userData = {
          id: loggedInUser.id,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          phone: loggedInUser.phone,
          address: loggedInUser.address,
          role: loggedInUser.role,
          avatar:loggedInUser.avatar
        };
  
        dispatch({ type: "LOGIN", payload: userData });
        localStorage.setItem("user", JSON.stringify(userData)); 
  
        Swal.fire({
          title: "Login Successful",
          text: "Welcome back!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
  
        navigate("/dashboard");
      } else {
        Swal.fire({
          title: "Error",
          text: "Invalid credentials",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
      });
    }
  };

  return (
    <div className="container d-inline">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h4 className="mb-0">Welcome back</h4>
                <p className="text-muted">Please enter your details</p>
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="remember" />
                    <label className="form-check-label" htmlFor="remember">
                      Remember for 30 days
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-decoration-none">Forgot password?</Link>
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3">Sign in</button>

                <button type="button" className="btn btn-outline-secondary w-100 mb-3">
                  <img
                    src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                    alt="Google"
                    style={{ width: '20px', marginRight: '8px' }}
                  />
                  Sign in with Google
                </button>

                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/signup" className="text-decoration-none">Sign up</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
