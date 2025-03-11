import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedUser = {
      firstName,
      lastName,
      phone,
      address,
      email,
      password: password || user.password,
    };

    try {
      await axios.patch(`https://json-server-api-q84y.onrender.com/users/${user.id}`, updatedUser);

      const newUser = { ...user, ...updatedUser };

      dispatch({ type: "UPDATE_USER", payload: newUser });
      localStorage.setItem("user", JSON.stringify(newUser));

      Swal.fire({
        title: "Success",
        text: "Profile updated!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setEditMode(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Update failed.",
        icon: "error",
      });
    }
  };

  const toggleEditMode = () => setEditMode(!editMode);

  return (
    <>
    <div className="container d-inline">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
        <div>
        <button className="btn btn-outline-primary mb-4" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i> Back
        </button>
        </div>
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img
                  src={user.avatar || "https://via.placeholder.com/200?text=Driver"}
                  alt="Profile"
                  className="img-fluid rounded-circle border border-2 border-primary mb-3"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
                <h4 className="mb-0">Your Profile</h4>
                <p className="text-muted">Manage your account details</p>
              </div>
              {editMode ? (
                /* Edit Form */
                <form onSubmit={handleUpdate}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="form-control"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        className="form-control"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-control"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      id="address"
                      className="form-control"
                      placeholder="Enter your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control"
                        placeholder="Enter new password (optional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Save Changes
                  </button>
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={toggleEditMode}>
                    Cancel
                  </button>
                </form>
              ) : (
                /* Profile Display */
                <div>
                  <div className="row ">
                    <div className="col-md-6">
                      <p className="mb-4"><strong>First Name:</strong> {user.firstName}</p>

                      <p className="mb-4"><strong>Last Name:</strong> {user.lastName}</p>
                    </div>
                  </div>
                  <p className="mb-4"><strong>Phone:</strong> {user.phone}</p>
                  <p className="mb-4"><strong>Address:</strong> {user.address}</p>
                  <p className="mb-4"><strong>Email:</strong> {user.email}</p>
                  <button className="btn btn-primary w-100" onClick={toggleEditMode}>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;