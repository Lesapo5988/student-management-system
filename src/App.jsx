import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'masapo-students'

const sampleStudents = [
  { id: 'DIWA-2024-001', fullName: 'Mpho Nthabiseng', age: 21, email: 'mpho.nthabiseng@example.com', course: 'Information Technology', isEnrolled: true },
  { id: 'DIWA-2024-002', fullName: 'Thabo Mokhehle', age: 23, email: 'thabo.mokhehle@example.com', course: 'Business Information Technology', isEnrolled: true },
  { id: 'DIWA-2024-003', fullName: 'Lerato Mokoena', age: 20, email: 'lerato.mokoena@example.com', course: 'Information Technology', isEnrolled: true },
  { id: 'DIWA-2024-004', fullName: 'Kabelo Rantšo', age: 24, email: 'kabelo.rantso@example.com', course: 'Software Engineering', isEnrolled: false },
  { id: 'DIWA-2024-005', fullName: 'Palesa Tšolo', age: 22, email: 'palesa.tsolo@example.com', course: 'Business Information Technology', isEnrolled: true },
  { id: 'DIWA-2024-006', fullName: 'Neo Lebajoa', age: 19, email: 'neo.lebajoa@example.com', course: 'Information Technology', isEnrolled: true },
  { id: 'DIWA-2024-007', fullName: 'Relebohile Sello', age: 25, email: 'relebohile.sello@example.com', course: 'Software Engineering', isEnrolled: false },
]

const emptyStudent = {
  id: '',
  fullName: '',
  age: '',
  email: '',
  course: '',
  isEnrolled: true,
}

function loadStudents() {
  try {
    const savedStudents = window.localStorage.getItem(STORAGE_KEY)
    if (!savedStudents) return { students: sampleStudents, warning: '' }

    const parsedStudents = JSON.parse(savedStudents)
    if (
      !Array.isArray(parsedStudents) ||
      !parsedStudents.every((student) =>
        student &&
        typeof student.id === 'string' &&
        typeof student.fullName === 'string' &&
        typeof student.age === 'number' &&
        typeof student.email === 'string' &&
        typeof student.course === 'string' &&
        typeof student.isEnrolled === 'boolean',
      )
    ) {
      throw new Error('Saved student data has an unexpected format.')
    }

    return { students: parsedStudents, warning: '' }
  } catch (error) {
    console.error('Could not load saved students:', error)
    return {
      students: sampleStudents,
      warning: 'Saved student data could not be loaded. Showing the sample records instead.',
    }
  }
}

function formatStudentId(students) {
  const highestId = students.reduce((highest, student) => {
    const match = student.id.match(/(\d+)$/)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)

  return `DIWA-2024-${String(highestId + 1).padStart(3, '0')}`
}

function getInitials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    enrolled: <><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="9" /></>,
    course: <><path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.3 2.7 8.7 2.7 12 0v-5M22 10v6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function StudentFormModal({ student, students, onClose, onSave }) {
  const isEditing = Boolean(student)
  const [formData, setFormData] = useState(() => (
    student
      ? { ...student, age: String(student.age) }
      : { ...emptyStudent, id: formatStudentId(students) }
  ))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleChange(event) {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validateStudent(data) {
    const validationErrors = {}
    const normalizedEmail = data.email.trim()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    const numericAge = Number(data.age)
    let ageError = ''
    const idIsTaken = students.some(
      (record) => record.id.toLowerCase() === data.id.trim().toLowerCase() &&
        record.id !== student?.id,
    )

    if (!data.id.trim()) validationErrors.id = 'Student ID is required.'
    else if (idIsTaken) validationErrors.id = 'This student ID is already in use.'
    if (!data.fullName.trim()) validationErrors.fullName = 'Full name is required.'
    if (!data.age) ageError = 'Age is required.'
    else if (!Number.isInteger(numericAge) || numericAge < 16 || numericAge > 100) ageError = 'Enter a whole number between 16 and 100.'
    if (ageError) validationErrors.age = ageError
    if (!normalizedEmail) validationErrors.email = 'Email address is required.'
    else if (!isValidEmail) validationErrors.email = 'Enter a valid email address.'
    if (!data.course) validationErrors.course = 'Select a course of study.'

    return validationErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateStudent(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave({
      ...formData,
      id: formData.id.trim(),
      fullName: formData.fullName.trim(),
      age: Number(formData.age),
      email: formData.email.trim(),
      course: formData.course,
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{isEditing ? 'UPDATE RECORD' : 'NEW RECORD'}</span>
            <h2 id="student-modal-title">{isEditing ? 'Edit student' : 'Add a student'}</h2>
            <p>Enter the student details below.</p>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close form">
            <Icon name="close" />
          </button>
        </div>

        <form className="student-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Student ID</span>
            <input name="id" value={formData.id} onChange={handleChange} placeholder="e.g. DIWA-2024-008" aria-invalid={Boolean(errors.id)} />
            {errors.id && <span className="field-error">{errors.id}</span>}
          </label>
          <label className="form-field">
            <span>Full name</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" autoFocus aria-invalid={Boolean(errors.fullName)} />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Age</span>
              <input name="age" type="number" min="16" max="100" step="1" value={formData.age} onChange={handleChange} placeholder="e.g. 20" aria-invalid={Boolean(errors.age)} />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </label>
            <label className="form-field">
              <span>Email address</span>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" aria-invalid={Boolean(errors.email)} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
          </div>
          <label className="form-field">
            <span>Course of study</span>
            <select name="course" value={formData.course} onChange={handleChange} aria-invalid={Boolean(errors.course)}>
              <option value="">Select a course</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Business Information Technology">Business Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Networking">Computer Networking</option>
              <option value="Multimedia Design">Multimedia Design</option>
            </select>
            {errors.course && <span className="field-error">{errors.course}</span>}
          </label>
          <label className="enrollment-toggle">
            <input name="isEnrolled" type="checkbox" checked={formData.isEnrolled} onChange={handleChange} />
            <span className="toggle-copy"><strong>Currently enrolled</strong><small>Mark this student as actively enrolled</small></span>
          </label>
          <div className="modal-actions">
            <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit">{isEditing ? 'Save changes' : 'Add student'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function DeleteModal({ student, onClose, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="modal-card delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div className="delete-icon"><Icon name="trash" size={22} /></div>
        <h2 id="delete-modal-title">Remove this student?</h2>
        <p><strong>{student.fullName}</strong> will be removed from your student records. This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>Keep student</button>
          <button className="button button-danger" type="button" onClick={onConfirm}>Delete student</button>
        </div>
      </section>
    </div>
  )
}

function StudentRow({ student, onEdit, onDelete }) {
  return (
    <tr>
      <td><span className="student-id">{student.id}</span></td>
      <td>
        <div className="student-person">
          <span className="avatar">{getInitials(student.fullName)}</span>
          <div className="person-copy"><strong>{student.fullName}</strong><span>{student.email}</span></div>
        </div>
      </td>
      <td className="age-cell">{student.age}</td>
      <td><span className="course-name">{student.course}</span></td>
      <td><span className={`status-badge ${student.isEnrolled ? 'status-enrolled' : 'status-inactive'}`}><span />{student.isEnrolled ? 'Enrolled' : 'Not enrolled'}</span></td>
      <td className="actions-cell">
        <div className="row-actions">
          <button className="row-action-button" type="button" onClick={() => onEdit(student)}>Edit</button>
          <button className="row-action-button row-delete-button" type="button" onClick={() => onDelete(student)}>Delete</button>
        </div>
      </td>
    </tr>
  )
}

function App() {
  const [initialData] = useState(loadStudents)
  const [students, setStudents] = useState(initialData.students)
  const [storageWarning, setStorageWarning] = useState(initialData.warning)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeModal, setActiveModal] = useState(null)

  function updateStudents(nextStudents) {
    setStudents(nextStudents)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents))
      setStorageWarning('')
    } catch (error) {
      console.error('Could not save student records:', error)
      setStorageWarning('Changes are not being saved in this browser. Check your storage settings.')
    }
  }

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return students.filter((student) => {
      const matchesSearch = !query || [
        student.fullName,
        student.id,
        student.email,
        student.course,
      ].some((value) => value.toLowerCase().includes(query))
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'enrolled' ? student.isEnrolled : !student.isEnrolled)
      return matchesSearch && matchesStatus
    })
  }, [students, searchQuery, statusFilter])

  const enrolledCount = students.filter((student) => student.isEnrolled).length
  const courseCount = new Set(students.map((student) => student.course)).size

  function saveStudent(student) {
    const existingStudent = students.some((current) => current.id === activeModal.student?.id)
    const nextStudents = existingStudent
      ? students.map((current) => current.id === activeModal.student.id ? student : current)
      : [student, ...students]
    updateStudents(nextStudents)
    setActiveModal(null)
  }

  function deleteStudent() {
    updateStudents(students.filter((student) => student.id !== activeModal.student.id))
    setActiveModal(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Masapo home">
          <span className="brand-mark">m<span>.</span></span>
          <span className="brand-name">masapo<span>campus</span></span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-navigation" aria-label="Main navigation">
          <a className="nav-item active" href="#students"><span className="nav-icon"><Icon name="users" /></span>Students<span className="nav-count">{students.length}</span></a>
          <a className="nav-item" href="#courses"><span className="nav-icon"><Icon name="course" /></span>Courses</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="campus-card">
            <span className="campus-icon"><Icon name="course" size={17} /></span>
            <div><strong>ICT Faculty</strong><span>Maseru, Lesotho</span></div>
            <span className="online-dot" aria-label="Active" />
          </div>
          <div className="profile-card">
            <span className="profile-avatar">HB</span>
            <span className="profile-copy"><strong>Hlabeli Batloung</strong><small>Administrator</small></span>
            <Icon name="more" size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area" id="students">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>Students</strong></div>
          <div className="topbar-right"><span className="academic-chip"><span /> Academic year 2024/25</span><span className="topbar-divider" /><span className="topbar-initials">HB</span></div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">FACULTY OF INFORMATION &amp; COMMUNICATION TECHNOLOGY</div>
              <h1>Student overview</h1>
              <p className="page-subtitle">Manage and keep track of your students, all in one place.</p>
            </div>
            <button className="button button-primary add-button" type="button" onClick={() => setActiveModal({ type: 'form' })}>
              <Icon name="plus" size={18} /> Add student
            </button>
          </div>

          {storageWarning && <div className="storage-warning" role="status">{storageWarning}</div>}

          <section className="stats-grid" aria-label="Student statistics">
            <article className="stat-card">
              <div className="stat-top"><span>Total students</span><span className="stat-icon stat-icon-blue"><Icon name="users" size={19} /></span></div>
              <div className="stat-value">{students.length}</div>
              <div className="stat-note">Across all registered courses</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Currently enrolled</span><span className="stat-icon stat-icon-green"><Icon name="enrolled" size={19} /></span></div>
              <div className="stat-value">{enrolledCount}<span className="stat-unit"> / {students.length}</span></div>
              <div className="stat-note">{students.length ? Math.round((enrolledCount / students.length) * 100) : 0}% of all students</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Courses represented</span><span className="stat-icon stat-icon-violet"><Icon name="course" size={19} /></span></div>
              <div className="stat-value">{courseCount}</div>
              <div className="stat-note">Active programmes</div>
            </article>
            <article className="stat-card stat-card-highlight">
              <div className="stat-top"><span>Semester</span><span className="semester-pill">SEM 03</span></div>
              <div className="stat-value">Semester 3</div>
              <div className="stat-note">Diploma in Information Technology</div>
            </article>
          </section>

          <section className="student-panel" aria-labelledby="student-list-title">
            <div className="panel-heading">
              <div><h2 id="student-list-title">All students</h2><p>A list of all students enrolled in your faculty.</p></div>
              <span className="records-count">{students.length} records</span>
            </div>
            <div className="table-toolbar">
              <label className="search-box">
                <Icon name="search" size={18} />
                <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search students..." aria-label="Search students" />
                <kbd>⌘ K</kbd>
              </label>
              <label className="filter-select">
                <span className="sr-only">Filter by enrollment status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All students</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="inactive">Not enrolled</option>
                </select>
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>STUDENT ID</th><th>STUDENT</th><th>AGE</th><th>COURSE OF STUDY</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onEdit={(record) => setActiveModal({ type: 'form', student: record })}
                      onDelete={(record) => setActiveModal({ type: 'delete', student: record })}
                    />
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon"><Icon name="search" size={22} /></span>
                  <strong>{students.length === 0 ? 'No students yet' : 'No matching students'}</strong>
                  <p>{students.length === 0 ? 'Add your first student to get started.' : 'Try another search or change the enrollment filter.'}</p>
                  {students.length === 0 && <button type="button" className="button button-primary" onClick={() => setActiveModal({ type: 'form' })}><Icon name="plus" size={16} /> Add student</button>}
                </div>
              )}
            </div>
            <div className="table-footer"><span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students</span><span className="footer-campus"><span /> Maseru Campus</span></div>
          </section>
          <footer className="page-footer"><span>© 2025 Masapo Campus. Student management.</span><span>DIWA2110 · Web Application Development</span></footer>
        </div>
      </main>

      {activeModal?.type === 'form' && (
        <StudentFormModal
          key={activeModal.student?.id || 'new-student'}
          student={activeModal.student}
          students={students}
          onClose={() => setActiveModal(null)}
          onSave={saveStudent}
        />
      )}
      {activeModal?.type === 'delete' && (
        <DeleteModal
          student={activeModal.student}
          onClose={() => setActiveModal(null)}
          onConfirm={deleteStudent}
        />
      )}
    </div>
  )
}

export default App
