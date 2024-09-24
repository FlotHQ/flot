package engine

import (
	"fmt"

	"github.com/flothq/flot/models"
)

func DetermineNextTasks(manifest *models.WorkflowManifest, executionState *models.WorkflowExecutionState, completedTaskID string) ([]string, error) {
	var nextTasks []string

	completedTask, ok := manifest.States[completedTaskID]
	if !ok {
		return nil, fmt.Errorf("completed task %s not found in workflow manifest", completedTaskID)
	}

	for _, dependantID := range completedTask.Dependants {
		dependantTask, ok := manifest.States[dependantID]
		if !ok {
			return nil, fmt.Errorf("dependant task %s not found in workflow manifest", dependantID)
		}

		allDependenciesMet := true
		for _, dependencyID := range dependantTask.DependsOn {
			dependencyState, exists := executionState.TaskExecutionStates[dependencyID]
			if !exists || dependencyState.State != models.TaskEventType_TASK_EVENT_TYPE_COMPLETED {
				allDependenciesMet = false
				break
			}
		}

		if allDependenciesMet {
			dependantState, exists := executionState.TaskExecutionStates[dependantID]
			if !exists || (dependantState.State != models.TaskEventType_TASK_EVENT_TYPE_STARTED && dependantState.State != models.TaskEventType_TASK_EVENT_TYPE_COMPLETED) {
				nextTasks = append(nextTasks, dependantID)
			}
		}
	}

	return nextTasks, nil
}
