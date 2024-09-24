package engine

import (
	"fmt"

	"github.com/flothq/flot/internal/emitter"
	"github.com/flothq/flot/models"
	"google.golang.org/protobuf/proto"
)

func RegisterWorkflowConsumers(we *WorkflowEngine) error {

	handler := func(msg emitter.Msg) {
		data := msg.Data()
		var event models.WorkflowEvent
		err := proto.Unmarshal(data, &event)
		if err != nil {
			msg.Term()
			return
		}

		switch event.Type {
		case models.WorkflowEventType_WORKFLOW_EVENT_TYPE_STARTED:
			handleWorkflowStarted(&event, msg, we)
		case models.WorkflowEventType_WORKFLOW_EVENT_TYPE_COMPLETED:
			handleWorkflowCompleted(&event, msg, we)
		case models.WorkflowEventType_WORKFLOW_EVENT_TYPE_FAILED:
			handleWorkflowFailed(&event, msg, we)
		case models.WorkflowEventType_WORKFLOW_EVENT_TYPE_PENDING:
			handleWorkflowPending(&event, msg, we)
		default:
			msg.Term()
		}
	}
	err := we.emitter.Listen("project.*.workflow.*", handler)
	return err
}

func handleWorkflowStarted(e *models.WorkflowEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("workflow started")

	m, err := we.GetManifest(e.ManifestId)

	if err != nil {
		msg.Nak()
		return
	}

	trigger := m.States[m.StartAt]
	if trigger == nil {
		msg.Nak()
		return
	}

	{
		event := &models.TaskEvent{
			Type:        models.TaskEventType_TASK_EVENT_TYPE_PENDING,
			ExecutionId: e.ExecutionId,
			ManifestId:  e.ManifestId,
			WorkflowId:  e.WorkflowId,
			ProjectId:   e.ProjectId,
			TaskId:      m.StartAt,
			Retries:     trigger.MaxRetries,
			Event: &models.TaskEvent_Pending{
				Pending: &models.TaskPendingEvent{},
			},
		}
		bytes, err := proto.Marshal(event)
		if err != nil {
			return
		}
		we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s.task.%s", m.ProjectId, e.WorkflowId, event.TaskId), bytes)
	}

	//TODO: execute the workflow
	msg.Ack()
}

func handleWorkflowCompleted(e *models.WorkflowEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("workflow completed")
	msg.Ack()
}

func handleWorkflowFailed(e *models.WorkflowEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("workflow failed")
	msg.Ack()
}

func handleWorkflowPending(e *models.WorkflowEvent, msg emitter.Msg, we *WorkflowEngine) {
	println("workflow pending ", e.ManifestId)

	if e.ManifestId == "" {
		panic("manifest id is empty")

	}

	m, err := we.GetManifest(e.ManifestId)

	if err != nil {
		println(fmt.Sprintf("error getting manifest %s, manifestId: %s", err.Error(), e.ManifestId))
		msg.Nak()
		return
	}

	execState := &models.WorkflowExecutionState{
		ExecutionId:         e.ExecutionId,
		WorkflowId:          m.WorkflowId,
		TaskExecutionStates: make(map[string]*models.TaskExecutionState),
	}

	bytes, err := proto.Marshal(execState)
	if err != nil {
		msg.Nak()
		return
	}

	err = we.execStore.Put(execState.ExecutionId, bytes)
	if err != nil {
		msg.Nak()
		return
	}

	started := &models.WorkflowEvent{
		Type:        models.WorkflowEventType_WORKFLOW_EVENT_TYPE_STARTED,
		ExecutionId: execState.ExecutionId,
		ManifestId:  e.ManifestId,
		WorkflowId:  e.WorkflowId,
		ProjectId:   e.ProjectId,
		Event: &models.WorkflowEvent_Started{
			Started: &models.WorkflowStartedEvent{
				StartAt: 1,
			},
		},
	}

	payload, err := proto.Marshal(started)
	if err != nil {
		println(err.Error())
		msg.Nak()
		return
	}

	we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s", m.ProjectId, e.WorkflowId), payload)
	msg.Ack()
}
