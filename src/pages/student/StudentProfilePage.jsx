import { useState } from "react";
import { useCampus } from "../../context/CampusContext";

function StudentProfilePage() {
  const { student, updateStudentProfile } = useCampus();
  const [form, setForm] = useState(() => ({
    enrollmentNumber: student.enrollmentNumber || student.rollNumber || "",
    branch: student.branch || "",
    cgpa: String(student.cgpa ?? ""),
    activeBacklogs: String(student.activeBacklogs ?? student.backlogs ?? 0),
    graduationYear: String(student.graduationYear ?? ""),
    phone: student.phone || "",
    skills: student.skills?.join(", ") || "",
    resumeUrl: student.resumeUrl || "",
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      await updateStudentProfile({
        ...form,
        branch: form.branch.trim().toUpperCase(),
        cgpa: Number(form.cgpa),
        activeBacklogs: Number(form.activeBacklogs),
        graduationYear: Number(form.graduationYear),
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      setMessage("Profile saved. Eligibility has been recalculated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-stack page-stack--narrow">
      <div className="page-header"><div><p className="eyebrow">Student account</p><h2>Your profile</h2><p>Keep academic details accurate so eligibility results remain correct.</p></div></div>
      <form className="form-card" onSubmit={handleSubmit}>
        {message && <p className="form-success" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-grid">
          <label>Name<input value={student.name || ""} disabled /></label>
          <label>Email<input value={student.email || ""} disabled /></label>
          <label>Enrollment number<input name="enrollmentNumber" value={form.enrollmentNumber || ""} onChange={updateField} required /></label>
          <label>Branch<input name="branch" value={form.branch || ""} onChange={updateField} required /></label>
          <label>CGPA<input type="number" name="cgpa" min="0" max="10" step="0.01" value={form.cgpa || ""} onChange={updateField} required /></label>
          <label>Active backlogs<input type="number" name="activeBacklogs" min="0" step="1" value={form.activeBacklogs || ""} onChange={updateField} required /></label>
          <label>Graduation year<input type="number" name="graduationYear" min="2000" max="2100" step="1" value={form.graduationYear || ""} onChange={updateField} required /></label>
          <label>Phone<input name="phone" value={form.phone || ""} onChange={updateField} /></label>
          <label className="form-grid__full">Skills<input name="skills" value={form.skills || ""} onChange={updateField} placeholder="React, Node.js, MongoDB" /><small>Separate skills with commas.</small></label>
          <label className="form-grid__full">Resume URL<input type="url" name="resumeUrl" value={form.resumeUrl || ""} onChange={updateField} placeholder="https://..." /></label>
        </div>
        <div className="form-actions"><button className="button button--primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save profile"}</button></div>
      </form>
    </div>
  );
}

export default StudentProfilePage;
