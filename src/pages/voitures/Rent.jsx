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
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Define professional color scheme
      const primaryColor = [42, 65, 87]; // Dark blue header
      const accentColor = [167, 139, 250]; // Your original purple color
      const lightGray = [240, 240, 240];
      
      // ===== HEADER SECTION =====
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, "F");
      
      // Add logo if available
      if (logo) {
        doc.addImage(logo, "PNG", 10, 7, 50, 20, undefined, 'FAST');
      }
      
      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CAR RENTAL AGREEMENT", 105, 22, { align: "center" });
      
      // ===== CONTRACT INFORMATION =====
      const contractNumber = `CRA-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const dateCreated = new Date().toLocaleDateString();
      
      // Add contract info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Contract #: ${contractNumber}`, 15, 45);
      doc.text(`Date: ${dateCreated}`, 150, 45);
      
      // Add introduction text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        "This Car Rental Agreement is made between the Rental Company and the Client.", 
        15, 55
      );
      
      // ===== VEHICLE INFORMATION SECTION =====
      let currentY = 65;
      
      // Add styled header for vehicle information
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("VEHICLE INFORMATION", 105, currentY + 6, { align: "center" });
      
      // Vehicle details table
      autoTable(doc, {
        startY: currentY + 10,
        margin: { left: 15, right: 15 },
        head: [["Field", "Details"]],
        body: [
          ["Car Model", car.modele || "N/A"],
          ["Registration Number", car.matricule || "N/A"],
          ["Daily Rate", `$${car.price}`],
        ],
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: { 
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: lightGray
        }
      });
      
      // ===== RENTAL DETAILS SECTION =====
      currentY = doc.lastAutoTable.finalY + 10;
      
      // Add styled header for rental details
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("RENTAL DETAILS", 105, currentY + 6, { align: "center" });
      
      // Calculate number of days
      let numberOfDays = 1;
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1) || 1;
      } catch (e) {
        console.warn("Error calculating days:", e);
      }
      
      // Rental details table
      autoTable(doc, {
        startY: currentY + 10,
        margin: { left: 15, right: 15 },
        head: [["Field", "Details"]],
        body: [
          ["Start Date", startDate ? new Date(startDate).toLocaleDateString() : "N/A"],
          ["End Date", endDate ? new Date(endDate).toLocaleDateString() : "N/A"],
          ["Number of Days", numberOfDays],
          ["Total Price", `$${totalPrice.toFixed(2)}`],
        ],
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: { 
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: lightGray
        }
      });
      
      // ===== CLIENT INFORMATION SECTION =====
      currentY = doc.lastAutoTable.finalY + 10;
      
      // Add styled header for client information
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("CLIENT INFORMATION", 105, currentY + 6, { align: "center" });
      
      // Client details table
      autoTable(doc, {
        startY: currentY + 10,
        margin: { left: 15, right: 15 },
        head: [["Field", "Details"]],
        body: [
          ["Full Name", `${loggedInUser.firstName || ""} ${loggedInUser.lastName || ""}`],
          ["Phone", loggedInUser.phone || "N/A"],
          ["Address", loggedInUser.address || "N/A"],
          ["Email", loggedInUser.email || "N/A"],
        ],
        theme: "grid",
        styles: { 
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: { 
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: lightGray
        }
      });
      
      // ===== TERMS AND CONDITIONS SECTION =====
      currentY = doc.lastAutoTable.finalY + 10;
      
      // Add styled header for terms
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("TERMS AND CONDITIONS", 105, currentY + 6, { align: "center" });
      
      // Terms content
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const terms = [
        "1. The client agrees to return the car in the same condition as received.",
        "2. The rental company is not responsible for any personal belongings left in the car.",
        "3. Any damages to the vehicle during the rental period will be charged to the client.",
        "4. The client agrees to abide by all traffic laws and regulations.",
        "5. Late returns may result in additional charges.",
      ];
      
      let yPos = currentY + 15;
      terms.forEach((term) => {
        doc.text(term, 15, yPos);
        yPos += 7;
      });
      
      // ===== SIGNATURES SECTION =====
      currentY = yPos + 10;
      
      // Add styled header for signatures
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SIGNATURES", 105, currentY + 6, { align: "center" });
      
      // Signature lines
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Client signature
      const clientSignY = currentY + 25;
      doc.line(15, clientSignY, 90, clientSignY);
      doc.text("Client Signature", 15, clientSignY + 5);
      
      // Company signature
      doc.line(115, clientSignY, 190, clientSignY);
      doc.text("Company Representative", 115, clientSignY + 5);
      
      // Date lines
      const dateSignY = clientSignY + 20;
      doc.line(15, dateSignY, 90, dateSignY);
      doc.text("Date", 15, dateSignY + 5);
      
      doc.line(115, dateSignY, 190, dateSignY);
      doc.text("Date", 115, dateSignY + 5);
      
      // ===== FOOTER =====
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | Contract #${contractNumber} | Generated on ${dateCreated}`,
          105,
          285,
          { align: "center" }
        );
      }
      
      // Save the PDF
      doc.save("Car_Rental_Agreement.pdf");
      
      // Return the document for email attachment if needed
      return doc;
      
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
