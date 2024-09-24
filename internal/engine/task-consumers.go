package engine

import (
	"fmt"
	"time"

	"github.com/flothq/flot/internal/emitter"
	"github.com/flothq/flot/models"
	"google.golang.org/protobuf/proto"
)

func RegisterTaskConsumers(we *WorkflowEngine) error {

	handler := func(msg emitter.Msg) {
		data := msg.Data()
		var event models.TaskEvent
		err := proto.Unmarshal(data, &event)
		if err != nil {
			msg.Term()
		}

		switch event.Type {
		case models.TaskEventType_TASK_EVENT_TYPE_STARTED:
			handleTaskStarted(&event, msg, we)
		case models.TaskEventType_TASK_EVENT_TYPE_COMPLETED:
			handleTaskCompleted(&event, msg, we)
		case models.TaskEventType_TASK_EVENT_TYPE_FAILED:
			handleTaskFailed(&event, msg, we)
		case models.TaskEventType_TASK_EVENT_TYPE_PENDING:
			handleTaskPending(&event, msg, we)
		case models.TaskEventType_TASK_EVENT_TYPE_BLOCKED:
			handleTaskBlocked(&event, msg, we)
		default:
			msg.Term()
		}

	}

	err := we.emitter.Listen("project.*.workflow.*.task.*", handler)
	return err
}

func handleTaskStarted(e *models.TaskEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("task started", e.ExecutionId)

	//TODO: make a request/reply to the required task service

	manifest, err := we.GetManifest(e.WorkflowId)
	if err != nil {
		msg.Nak()
		return
	}

	taskDefinition := manifest.States[e.TaskId]

	if taskDefinition == nil {
		msg.Nak()
		return
	}

	switch taskDefinition.TaskType {
	case models.TaskType_TASK_TYPE_INPUT:
		//TODO evaluate the output and store into the stae
	case models.TaskType_TASK_TYPE_DELAY:
		//TODO figure out how to implement this
	default:
		subject := fmt.Sprintf("tasks.%s.%s", taskDefinition.TaskType.String(), taskDefinition.TaskIdentifier)

		responseMsg, err := we.emitter.Request(subject, nil, time.Second*10)
		if err != nil {
			println(fmt.Sprintf("failed to request task %s, %s", e.TaskId, err.Error()))
			return
		}

		err = we.execLock.Lock(e.ExecutionId)
		if err != nil {
			println("failed to lock execution")
			msg.Nak()
			return
		}
		defer we.execLock.Unlock(e.ExecutionId)

		var executionState models.WorkflowExecutionState

		executionEntry, err := we.execStore.Get(e.ExecutionId)
		if err != nil {
			println(fmt.Sprintf("failed to get execution: %s", err.Error()))
			msg.Nak()
			return
		}

		err = proto.Unmarshal(executionEntry, &executionState)
		if err != nil {
			println(fmt.Sprintf("failed to unmarshal execution: %s", err.Error()))
			msg.Nak()
			return
		}

		if executionState.TaskExecutionStates[e.TaskId] == nil {
			println(fmt.Sprintf("task %s not found in execution %s", e.TaskId, e.ExecutionId))
			msg.Nak()
			return
		}

		var taskExecutionResult models.TaskExecutionResult

		err = proto.Unmarshal(responseMsg.Data(), &taskExecutionResult)
		if err != nil {
			println(fmt.Sprintf("failed to unmarshal task execution result: %s", err.Error()))
			msg.Nak()
			return
		}

		executionState.TaskExecutionStates[e.TaskId].Output = taskExecutionResult.Data
		executionState.TaskExecutionStates[e.TaskId].State = models.TaskEventType_TASK_EVENT_TYPE_COMPLETED

		bytes, err := proto.Marshal(&executionState)
		if err != nil {
			println(fmt.Sprintf("failed to marshal execution state: %v", err))
			msg.Nak()
			return
		}

		err = we.execStore.Put(e.ExecutionId, bytes)
		if err != nil {
			println(fmt.Sprintf("failed to put execution state: %v", err))
			msg.Nak()
			return
		}
	}

	err = we.execLock.Unlock(e.ExecutionId)
	if err != nil {
		println(fmt.Sprintf("failed to put execution state: %v", err))
		msg.Nak()
		return
	}

	completed := &models.TaskEvent{
		Type:        models.TaskEventType_TASK_EVENT_TYPE_COMPLETED,
		TaskId:      e.TaskId,
		ExecutionId: e.ExecutionId,
		ManifestId:  e.ManifestId,
		ProjectId:   e.ProjectId,
		WorkflowId:  e.WorkflowId,
		Retries:     e.Retries,
		Event: &models.TaskEvent_Completed{
			Completed: &models.TaskCompletedEvent{},
		},
	}

	bytes, err := proto.Marshal(completed)
	if err != nil {
		println(fmt.Sprintf("failed to put execution state: %v", err))
		msg.Nak()
		return
	}

	we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s.task.%s", e.ProjectId, e.WorkflowId, e.TaskId), bytes)

	msg.Ack()
}

func handleTaskCompleted(e *models.TaskEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("task completed")

	manifest, err := we.GetManifest(e.ManifestId)
	if err != nil {
		msg.Nak()
		return
	}

	err = we.execLock.Lock(e.ExecutionId)
	if err != nil {
		msg.Nak()
		return
	}

	defer we.execLock.Unlock(e.ExecutionId)

	result, err := we.execStore.Get(e.GetExecutionId())
	if err != nil {
		msg.Nak()
		return
	}

	var executionState models.WorkflowExecutionState

	err = proto.Unmarshal(result, &executionState)
	if err != nil {
		msg.Nak()
		return
	}

	nextTasks, err := DetermineNextTasks(manifest, &executionState, e.TaskId)
	if err != nil {
		msg.Nak()
		return
	}

	if len(nextTasks) == 0 && len(executionState.TaskExecutionStates) == len(manifest.States) {
		// todo fix
		completed := &models.WorkflowEvent{
			Type:        models.WorkflowEventType_WORKFLOW_EVENT_TYPE_COMPLETED,
			ExecutionId: e.ExecutionId,
			ManifestId:  e.ManifestId,
			ProjectId:   e.ProjectId,
			WorkflowId:  e.WorkflowId,
			Event: &models.WorkflowEvent_Completed{
				Completed: &models.WorkflowCompletedEvent{
					WorkflowId: e.WorkflowId,
					Duration:   0,
				},
			},
		}

		bytes, err := proto.Marshal(completed)
		if err != nil {
			msg.Nak()
			return
		}

		we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s", e.ProjectId, e.WorkflowId), bytes)
	} else {
		for _, task := range nextTasks {
			pending := &models.TaskEvent{
				Type:        models.TaskEventType_TASK_EVENT_TYPE_PENDING,
				TaskId:      task,
				ExecutionId: e.ExecutionId,
				ManifestId:  e.ManifestId,
				ProjectId:   e.ProjectId,
				WorkflowId:  e.WorkflowId,
				Retries:     e.Retries,
				Event: &models.TaskEvent_Pending{
					Pending: &models.TaskPendingEvent{},
				},
			}

			bytes, err := proto.Marshal(pending)
			if err != nil {
				msg.Nak()
				return
			}

			we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s.task.%s", e.ProjectId, e.WorkflowId, task), bytes)
		}
	}

	bytes, err := proto.Marshal(&executionState)
	if err != nil {
		msg.Nak()
		return
	}

	err = we.execStore.Put(e.GetExecutionId(), bytes)
	if err != nil {
		msg.Nak()
		return
	}

	err = we.execLock.Unlock(e.ExecutionId)
	if err != nil {
		msg.Nak()
		return
	}

	msg.Ack()
}

func handleTaskFailed(e *models.TaskEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("task failed")
	msg.Ack()
}

func handleTaskPending(e *models.TaskEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("task pending")

	err := we.execLock.Lock(e.ExecutionId)
	if err != nil {
		println(fmt.Sprintf("failed to lock execution %s", err.Error()))
		msg.Nak()
		return
	}
	defer we.execLock.Unlock(e.ExecutionId)

	executionState, err := we.GetWorkflowExecutionState(e.ExecutionId)
	if err != nil {
		println(fmt.Sprintf("failed to get execution state %s", e.ExecutionId))
		msg.Nak()
		return
	}

	if executionState.TaskExecutionStates == nil {
		executionState.TaskExecutionStates = make(map[string]*models.TaskExecutionState)
	}

	executionState.TaskExecutionStates[e.TaskId] = &models.TaskExecutionState{
		TaskId: e.TaskId,
		State:  models.TaskEventType_TASK_EVENT_TYPE_PENDING,
	}

	bytes, err := proto.Marshal(executionState)
	if err != nil {
		println(fmt.Sprintf("failed to marshal execution state: %v", err))
		msg.Nak()
		return
	}

	err = we.execStore.Put(e.ExecutionId, bytes)
	if err != nil {
		print(fmt.Sprintf("failed to put execution state: %v", err))
		msg.Nak()
		return
	}

	err = we.execLock.Unlock(e.ExecutionId)
	if err != nil {
		println(fmt.Sprintf("failed to unlock execution: %v", err))
		msg.Nak()
		return
	}

	started := &models.TaskEvent{
		Type:        models.TaskEventType_TASK_EVENT_TYPE_STARTED,
		TaskId:      e.TaskId,
		ExecutionId: e.ExecutionId,
		ManifestId:  e.ManifestId,
		WorkflowId:  e.WorkflowId,
		ProjectId:   e.ProjectId,
		Retries:     e.Retries,
		Event: &models.TaskEvent_Started{
			Started: &models.TaskStartedEvent{},
		},
	}

	bytes, err = proto.Marshal(started)
	if err != nil {
		println(fmt.Sprintf("failed to marshal task started event: %s", err))
		msg.Nak()
		return
	}

	we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s.task.%s", e.ProjectId, e.WorkflowId, e.TaskId), bytes)
	msg.Ack()
}

func handleTaskBlocked(e *models.TaskEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("task blocked")
	msg.Ack()
}
