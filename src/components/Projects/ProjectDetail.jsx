import { useState } from 'react'
import RequirementsStep from './RequirementsStep'

function ProjectDetail({ project, onBack, onToggleStep, onFileUpload, onDeleteFile, inventory, onUpdateRequirements, allProjects, onCreateOrder, orders, onUpdateInventory }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set())

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }
  const handleFileUpload = (stepId, event) => {
    const file = event.target.files[0]
    if (file) {
      onFileUpload(project.id, stepId, file)
    }
  }

  const handleDeleteFile = (stepId, fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      onDeleteFile(project.id, stepId, fileId)
    }
  }

  const handleOneDriveUpload = (stepId) => {
    // OneDrive file picker integration
    const oneDriveUrl = prompt('Enter OneDrive file share link:')
    if (oneDriveUrl && oneDriveUrl.trim()) {
      // Ask user for a custom name for the file
      const fileName = prompt('Enter a name for this file:', 'Contract Document')
      if (fileName && fileName.trim()) {
        const fakeFile = {
          name: fileName.trim(),
          url: oneDriveUrl
        }
        onFileUpload(project.id, stepId, fakeFile, true) // true flag for cloud file
      }
    }
  }

  return (
    <div>
      <button 
        className="back-btn" 
        onClick={onBack}
      >
        ← Back to Projects
      </button>
      <h3>{project.name}</h3>
      
      <div className="project-steps">
        {project.steps.map(step => {
          const isExpanded = expandedSteps.has(step.id)
          return (
            <div key={step.id} className={`step-card ${step.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}>
              <div className="step-header" onClick={() => toggleStepExpansion(step.id)}>
                <div className="step-info">
                  <div className="step-checkbox-container">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) => {
                        e.stopPropagation()
                        onToggleStep(project.id, step.id)
                      }}
                      className="step-checkbox"
                    />
                  </div>
                  <span className="step-name">{step.name}</span>
                  {step.completed && <span className="completion-badge">✓</span>}
                </div>
                <div className="step-expand-icon">
                  <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>▼</span>
                </div>
              </div>
              
              <div className={`step-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="step-content-inner">
                  {step.name !== 'Requirements' && (
                    <>
                      <div className="file-upload-options">
                        <label className="file-upload-btn">
                          📁 Local File
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(step.id, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button 
                          className="onedrive-upload-btn"
                          onClick={() => handleOneDriveUpload(step.id)}
                        >
                          ☁️ OneDrive
                        </button>
                      </div>
                      
                      {step.files.length > 0 && (
                        <div className="step-files">
                          {step.files.map(file => (
                            <div key={file.id} className="file-item">
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                📄 {file.name}
                              </a>
                              <button 
                                className="delete-file-btn"
                                onClick={() => handleDeleteFile(step.id, file.id)}
                                title="Delete file"
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {step.name === 'Requirements' && (
                    <RequirementsStep 
                      project={project}
                      stepId={step.id}
                      inventory={inventory}
                      onUpdateRequirements={onUpdateRequirements}
                      allProjects={allProjects}
                      onCreateOrder={onCreateOrder}
                      orders={orders}
                      onUpdateInventory={onUpdateInventory}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectDetail
