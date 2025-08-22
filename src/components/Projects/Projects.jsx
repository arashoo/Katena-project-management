import { useState } from 'react'
import ProjectsList from './ProjectsList'
import ProjectDetail from './ProjectDetail'

function Projects({ projects, setProjects, inventory, onCreateOrder, orders, onUpdateInventory }) {
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [activeTab, setActiveTab] = useState('current')

  const getProjectStatus = (project) => {
    const completedSteps = project.steps.filter(step => step.completed).length
    const totalSteps = project.steps.length
    
    if (completedSteps === 0) return 'upcoming'
    if (completedSteps === totalSteps) return 'finished'
    return 'current'
  }

  const categorizeProjects = () => {
    return {
      upcoming: projects.filter(project => getProjectStatus(project) === 'upcoming'),
      current: projects.filter(project => getProjectStatus(project) === 'current'),
      finished: projects.filter(project => getProjectStatus(project) === 'finished')
    }
  }

  const categorizedProjects = categorizeProjects()
  const currentProjects = categorizedProjects[activeTab]

  const addProject = (projectName) => {
    const newProject = {
      id: Date.now(),
      name: projectName,
      steps: [
        { id: 1, name: 'Contract', completed: false, files: [] },
        { id: 2, name: 'Measurements', completed: false, files: [] },
        { id: 3, name: 'Drawing', completed: false, files: [] },
        { id: 4, name: 'Requirements', completed: false, files: [], requirements: [] }
      ]
    }
    setProjects([...projects, newProject])
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId))
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null)
    }
  }

  const editProject = (projectId, newName) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, name: newName }
        : project
    ))
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({ ...prev, name: newName }))
    }
  }

  const toggleStepComplete = (projectId, stepId) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            steps: project.steps.map(step =>
              step.id === stepId ? { ...step, completed: !step.completed } : step
            )
          }
        : project
    ))
    
    // Update the selected project to reflect the changes immediately
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        )
      }))
    }
  }

  const addFileToStep = (projectId, stepId, file, isCloudFile = false) => {
    let newFile
    
    if (isCloudFile) {
      // For cloud files, file is already an object with name and url
      newFile = { id: Date.now(), name: file.name, url: file.url, isCloud: true }
    } else {
      // For local files, create object URL
      newFile = { id: Date.now(), name: file.name, url: URL.createObjectURL(file), isCloud: false }
    }
    
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            steps: project.steps.map(step =>
              step.id === stepId 
                ? { ...step, files: [...step.files, newFile] }
                : step
            )
          }
        : project
    ))
    
    // Update the selected project to reflect the file upload immediately
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId 
            ? { ...step, files: [...step.files, newFile] }
            : step
        )
      }))
    }
  }

  const deleteFile = (projectId, stepId, fileId) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            steps: project.steps.map(step =>
              step.id === stepId 
                ? { ...step, files: step.files.filter(file => file.id !== fileId) }
                : step
            )
          }
        : project
    ))
    
    // Update the selected project to reflect the file deletion immediately
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId 
            ? { ...step, files: step.files.filter(file => file.id !== fileId) }
            : step
        )
      }))
    }
  }

  const updateRequirements = (projectId, stepId, requirements) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            steps: project.steps.map(step =>
              step.id === stepId 
                ? { ...step, requirements: requirements }
                : step
            )
          }
        : project
    ))
    
    // Update the selected project to reflect the requirements changes immediately
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId 
            ? { ...step, requirements: requirements }
            : step
        )
      }))
    }
  }

  return (
    <div className="projects-container">
      {!selectedProject ? (
        <>
          <div className="projects-header">
            <h2>Project Management</h2>
          </div>
          
          {/* Project Status Tabs */}
          <div className="projects-tabs">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              � Upcoming ({categorizedProjects.upcoming.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              � In Progress ({categorizedProjects.current.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'finished' ? 'active' : ''}`}
              onClick={() => setActiveTab('finished')}
            >
              ✅ Completed ({categorizedProjects.finished.length})
            </button>
          </div>

          <ProjectsList 
            projects={currentProjects}
            onSelectProject={setSelectedProject}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onEditProject={editProject}
            showAddForm={showAddProject}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            setShowAddForm={setShowAddProject}
            activeTab={activeTab}
          />
        </>
      ) : (
        <ProjectDetail 
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onToggleStep={toggleStepComplete}
          onFileUpload={addFileToStep}
          onDeleteFile={deleteFile}
          inventory={inventory}
          onUpdateRequirements={updateRequirements}
          allProjects={projects}
          onCreateOrder={onCreateOrder}
          orders={orders}
          onUpdateInventory={onUpdateInventory}
        />
      )}
    </div>
  )
}

export default Projects
