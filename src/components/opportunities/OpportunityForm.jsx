import { useState } from "react";

const initialForm = {
  company: "",
  role: "",
  description: "",
  location: "",
  package: "",
  eligibleBranches: "CSE, IT",
  minimumCgpa: "6.0",
  maximumBacklogs: "0",
  graduationYear: "2027",
  deadline: "",
  applicationLink: "",
  status: "active",
};

function OpportunityForm({ onSubmit, isSubmitting = false }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      eligibleBranches: form.eligibleBranches
        .split(",")
        .map((branch) => branch.trim().toUpperCase())
        .filter(Boolean),
      minimumCgpa: Number(form.minimumCgpa),
      maximumBacklogs: Number(form.maximumBacklogs),
      graduationYear: Number(form.graduationYear),
    });
    setForm(initialForm);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Basic information</p>
            <h2>Company and role</h2>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Company name
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Example: TechNova"
              required
            />
          </label>
          <label>
            Job role
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Example: Software Engineer"
              required
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Bengaluru or Remote"
              required
            />
          </label>
          <label>
            Package
            <input
              name="package"
              value={form.package}
              onChange={handleChange}
              placeholder="₹8 LPA"
              required
            />
          </label>
          <label className="form-grid__full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role and responsibilities"
              rows="5"
              required
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Eligibility</p>
            <h2>Student requirements</h2>
          </div>
        </div>

        <div className="form-grid">
          <label className="form-grid__full">
            Eligible branches
            <input
              name="eligibleBranches"
              value={form.eligibleBranches}
              onChange={handleChange}
              placeholder="CSE, IT, ECE"
              required
            />
            <small>Separate branch names with commas.</small>
          </label>
          <label>
            Minimum CGPA
            <input
              type="number"
              name="minimumCgpa"
              value={form.minimumCgpa}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.1"
              required
            />
          </label>
          <label>
            Maximum backlogs
            <input
              type="number"
              name="maximumBacklogs"
              value={form.maximumBacklogs}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
          <label>
            Graduation year
            <input
              type="number"
              name="graduationYear"
              value={form.graduationYear}
              onChange={handleChange}
              min="2026"
              required
            />
          </label>
          <label>
            Application deadline
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-grid__full">
            Application link
            <input
              type="url"
              name="applicationLink"
              value={form.applicationLink}
              onChange={handleChange}
              placeholder="https://company.com/apply"
              required
            />
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish opportunity"}
        </button>
      </div>
    </form>
  );
}

export default OpportunityForm;
