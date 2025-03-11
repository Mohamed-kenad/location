import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sexe, setSexe] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get("http://localhost:8080/users");
      const users = response.data;

      if (users.some(user => user.email === email)) {
        Swal.fire({
          title: "Error",
          text: "Email is already in use!",
          icon: "error",
        });
        return;
      }

      const newUser = {
        firstName,
        lastName,
        sexe,
        phone,
        address,
        email,
        password,
        avatar: sexe === "Male" 
        ? "https://cdn-icons-png.flaticon.com/512/3135/3135725.png"
        : "https://cdn-icons-png.flaticon.com/512/3135/3135789.png", 
        role: "user"
      };

      await axios.post("http://localhost:8080/users", newUser);

      Swal.fire({
        title: "Registration Successful",
        text: "You can now log in!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      
    } catch (error) {
      console.error("Error during registration:", error);
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
                <h4 className="mb-0">Create an Account</h4>
                <p className="text-muted">Join us today!</p>
              </div>
              <form onSubmit={handleRegister}>

                {/* First Name, Last Name in the same row */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>


                {/* Phone & Address in the same row */}
                <div className="row">
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="0622222222"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                {/* Gender in a new row */}
                <div className="mb-3">
                  <label className="form-label">Sexe</label>
                  <select
                    className="form-control"
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value)}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3">Sign Up</button>

                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-decoration-none">Sign in</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
