import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { Footer } from './Voitures';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/logo.png";
import emailjs from "@emailjs/browser";



const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const car = location.state?.rent;
  const initialDate = location.state?.date;
  
  const now = new Date();
  now.setDate(now.getDate() + initialDate);  
  const newDate = now.toISOString().split('T')[0];  
 
  
  
  const [startDate, setStartDate] = useState(newDate || "");  
  const [endDate, setEndDate] = useState("");
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
  
    if (!loggedInUser) {
      Swal.fire({
        title: "Authentication Required",
        text: "You must be logged in to book a car.",
        icon: "warning",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }
  
    if (!loggedInUser.firstName || !loggedInUser.lastName || !loggedInUser.phone || !loggedInUser.email || !loggedInUser.address) {
      Swal.fire({
        title: "Incomplete Profile",
        text: "Please complete your profile before booking.",
        icon: "warning",
        confirmButtonText: "Update Profile",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/profile");
        }
      });
      return;
    }
  
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const totalPrice = diffDays * car.price;
    
    try {
      let clientId = loggedInUser.id;
  
      let clientExists = true;
      try {
        const response = await axios.get(`http://localhost:8080/client/${clientId}`);

        if (!response.data) {
          clientExists = false;
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          clientExists = false;
        } else {
          throw err; 
        }
      }
  
      if (!clientExists) {
        await axios.post("http://localhost:8080/client", {
          id: loggedInUser.id,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          address: loggedInUser.address,
          phone: loggedInUser.phone,
        });
      }
      const booking = {
        clientId: clientId,
        voitureId: car.id,
        datedebut: startDate,
        datefin: endDate,
        prix: car.price,
        total: totalPrice,
        statut: "pending",
      };
  
      await axios.post("http://localhost:8080/contrats",booking);

       generatePDF({ car, startDate, endDate, totalPrice,loggedInUser });
       sendEmailWithAttachment(loggedInUser.email, `${loggedInUser.firstName} ${loggedInUser.lastName}`, generatePDF);
  
      Swal.fire("Ajouté!", "Your reservation has been successfully confirmed!", "success").then((result) => {
        if (result.isConfirmed) {
          navigate("/tracking");
        }
      });
  
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "An error occurred while processing your booking. Please try again.", "error");
    }
  };

  
 
  const sendEmailWithAttachment = (clientEmail, clientName, pdfBase64) => {
  
    const emailParams = {
      to_email: clientEmail,
      to_name: clientName,
      message: "Attached is your car rental agreement.",
      attachment: [
        {
          content: pdfBase64,
          filename: "Car_Rental_Agreement.pdf", 
          type: "application/pdf",
          disposition: "attachment", 
        },
      ],
    };
  
    emailjs
      .send("service_dgwl2r8", "template_ymdxj57", emailParams, "4p5lXy57-luPlmsnY")
      .then((response) => {
        console.log("✅ Email sent successfully!", response);
      })
      .catch((error) => {
        console.error("❌ Error sending email:", error);
        Swal.fire("Error", "Failed to send the contract via email.", "error");
      });
  };
  
  const generatePDF = ({ car, startDate, endDate, totalPrice, loggedInUser }) => {
    try {
      const doc = new jsPDF();
  
      if (logo) {
        doc.addImage(logo, "PNG", 10, 5, 50, 20, undefined, 'FAST');
      }
  
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("CAR RENTAL AGREEMENT", 60, 30);
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This Car Rental Agreement is made between the Rental Company and the Client.", 
        10, 45
      );
  
      autoTable(doc, {
        startY: 60,
        head: [["Field", "Details"]],
        body: [
          ["Car Model", car.modele],
          ["Car registration number", car.matricule],
          ["Start Date", startDate],
          ["End Date", endDate],
          ["Total Price", `$${totalPrice.toFixed(2)}`],
          ["Client Name", `${loggedInUser.firstName} ${loggedInUser.lastName}`],
          ["Phone", loggedInUser.phone],
          ["Address", loggedInUser.address],
        ],
        theme: "grid",
        styles: { fontSize: 12 },
        headStyles: { fillColor: [167, 139, 250] },
      });
  
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.text("Terms and Conditions:", 10, finalY);
  
      doc.setFont("helvetica", "normal");
      const terms = [
        "1. The client agrees to return the car in the same condition as received.",
        "2. The rental company is not responsible for any personal belongings left in the car.",
        "3. Any damages to the vehicle during the rental period will be charged to the client.",
        "4. The client agrees to abide by all traffic laws and regulations.",
        "5. Late returns may result in additional charges.",
      ];
  
      let yPos = finalY + 10;
      terms.forEach((term) => {
        doc.text(term, 10, yPos);
        yPos += 8;
      });
  
      doc.setFont("helvetica", "bold");
      doc.text("Client Signature: ___________________", 10, yPos + 10);
      doc.text("Company Representative Signature: ___________________", 10, yPos + 20);
  
      const dateCreated = new Date().toLocaleDateString();
      doc.text(`Date Created: ${dateCreated}`, 10, yPos + 40);
  
      // ✅ تحميل ملف PDF بدلاً من إرساله عبر البريد
      doc.save("Car_Rental_Agreement.pdf");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire("Error", "Failed to generate PDF.", "error");
    }
  };
      
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !car.price) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24) + 1);
    return diffInDays * parseFloat(car.price);
};


  return (
    <>
    
    <div className="d-flex flex-column min-vh-50">
      <main className=" container d-inline py-5 my-3">
        <button className="btn btn-outline-primary mb-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="fs-2 fw-bold mb-4">Book Your Rental</h1>

        <div className="row g-4">

          <div className="col-12 col-md-6 mt-3">
            <div className="card border-0 position-relative">
              <img src={car.image || "/placeholder.svg"} alt={car.model} className="card-img-top rounded-3 shadow-sm" style={{maxHeight:"400px"}}/>
              <span 
              style={{
                position: 'absolute',
                top: '15px',  
                left: '20px',
                background: car.disponible 
                  ? 'linear-gradient(135deg, #34C759 0%, #28A745 100%)' 
                  : 'linear-gradient(135deg, #FF4444 0%, #DC3545 100%)', 
                color: 'white',
                padding: '6px 18px', 
                borderRadius: '25px', 
                fontWeight: '500', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                transition: 'all 0.3s ease', 
              }}
            >
              {car.disponible ? "Disponible" : "Non Disponible"}
            </span>
            {initialDate !== 0 ?
            <div 
              className="position-absolute bottom-50 start-50 translate-middle-x mb-4 w-100"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 15px',

                
              }}
            >

              <p 
                className="mb-0 text-white text-center"
                style={{
                  fontSize: '1rem',
                  fontWeight: '400',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)', 
                }}
              >
                 Available in {initialDate} day (s)  
              </p>
            </div>:""
        }
              <div className="card-body px-0">
                <h2 className="fs-3 fw-semibold mt-2">{car.model}</h2>
                <p className="fs-4 fw-bold">${car.price} / day</p>
              </div>
            </div>
          </div>



          <div className="col-12 col-md-6 my-auto">
            <div className="card border-0 shadow-sm p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label htmlFor="startDate" className="form-label fw-medium">
                        Start Date
                      </label>
                      <input 
                        type="date" 
                        id="startDate"
                        className="form-control form-control-lg" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <label htmlFor="endDate" className="form-label fw-medium">
                        End Date
                      </label>
                      <input 
                        type="date" 
                        id="endDate"
                        className="form-control form-control-lg" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                    <div className="col-12">
                        <label className="form-label fw-medium">Prix Total</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text form-control form-control-lg">{calculateTotalPrice()} DH</span>
                        </div>
                    </div>
                    {/* <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input type="text" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">CIN</label>
                        <input type="text" className="form-control" value={cin} onChange={(e) => setCin(e.target.value)} required />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Permis</label>
                        <input type="text" className="form-control" value={permis} onChange={(e) => setPermis(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Adresse</label> 
                        <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} required />
                      </div>
                    </div> */}
                  <div className="col-12">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 mt-3 shadow-sm"
                    >
                      Confirm Booking ({calculateTotalPrice()} DH)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
  
    </div>
      <Footer/>
    </>
   
  );
};

export default BookingPage;
