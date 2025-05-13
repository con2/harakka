// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";

// const ContactForm = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const onSubmit = async (data: any) => {
//     setIsSubmitting(true);
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       const response = await axios.post("http://localhost:3000/mail/send", {
//         to: data.email,
//         subject: data.subject,
//         message: data.message,
//       });

//       if (response.data.success) {
//         setSuccessMessage("Your message was sent successfully!");
//       } else {
//         setErrorMessage("Failed to send message. Please try again later.");
//       }
//     } catch (error) {
//       setErrorMessage("Failed to send message. Please try again later.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Contact Us</h2>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div>
//           <label>Email</label>
//           <input {...register("email", { required: "Email is required" })} />
//           {errors.email && <p>{errors.email.message}</p>}
//         </div>

//         <div>
//           <label>Subject</label>
//           <input {...register("subject", { required: "Subject is required" })} />
//           {errors.subject && <p>{errors.subject.message}</p>}
//         </div>

//         <div>
//           <label>Message</label>
//           <textarea {...register("message", { required: "Message is required" })}></textarea>
//           {errors.message && <p>{errors.message.message}</p>}
//         </div>

//         <button type="submit" disabled={isSubmitting}>Submit</button>
//       </form>

//       {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//       {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
//     </div>
//   );
// };

// export default ContactForm;