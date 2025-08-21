function ProjectsList({ projects, onSelectProject, onAddProject, onDeleteProject, onEditProject, showAddForm, newProjectName, setNewProjectName, setShowAddForm, activeTab }) {
  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName)
      setNewProjectName('')
      setShowAddForm(false)
    }
  }

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation() // Prevent opening the project
    if (confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(projectId)
    }
  }

  const handleEditProject = (e, project) => {
    e.stopPropagation() // Prevent opening the project
    const newName = prompt('Enter new project name:', project.name)
    if (newName && newName.trim() && newName !== project.name) {
      onEditProject(project.id, newName.trim())
    }
  }

  const getStatusMessage = () => {
    switch (activeTab) {
      case 'upcoming':
        return 'Projects that haven\'t been started yet'
      case 'current':
        return 'Projects currently in progress'
      case 'finished':
        return 'Completed projects'
      default:
        return ''
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'upcoming':
        return 'No upcoming projects. Add a new project to get started!'
      case 'current':
        return 'No projects in progress. Start working on an upcoming project!'
      case 'finished':
        return 'No finished projects yet. Complete some current projects!'
      default:
        return 'No projects found.'
    }
  }

  return (
    <div className="projects-list">
      <div className="projects-header">
        <div className="tab-description">
          <p>{getStatusMessage()}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(true)}
        >
          <span>+</span> Add Project
        </button>
      </div>

      {showAddForm && (
        <div className="add-item-form">
          <h4>Add New Project</h4>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAddProject}>Add Project</button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No {activeTab} projects</h3>
            <p className="empty-state-description">{getEmptyMessage()}</p>
          </div>
        ) : (
          projects.map(project => {
            const completedSteps = project.steps.filter(s => s.completed).length
            const totalSteps = project.steps.length
            const progressPercent = Math.round((completedSteps / totalSteps) * 100)
            
            return (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => onSelectProject(project)}
              >
                <div className="project-header">
                  <h3 className="project-title">{project.name}</h3>
                  <div className="project-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={(e) => handleEditProject(e, project)}
                      title="Edit project"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="project-progress">
                  <div className="progress-info">
                    <span className="progress-text">
                      {completedSteps} of {totalSteps} steps completed
                    </span>
                    <span className="progress-percentage">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ProjectsList
