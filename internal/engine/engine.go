package engine

import (
	"fmt"

	"github.com/flothq/flot/internal/emitter"
	"github.com/flothq/flot/internal/kv"
	"github.com/flothq/flot/internal/lock"
	"github.com/flothq/flot/models"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

type WorkflowEngine struct {
	execLock      lock.Lock
	manifestStore kv.KeyValue
	execStore     kv.KeyValue
	emitter       emitter.Emitter
}

type Options struct {
	Levels []string
}

type Option func(*Options)

func WithLevels(levels []string) Option {
	return func(o *Options) {
		o.Levels = levels
	}
}

func (we *WorkflowEngine) GetManifest(id string) (*models.WorkflowManifest, error) {
	bytes, err := we.manifestStore.Get(id)
	if err != nil {
		return nil, err
	}

	var manifest models.WorkflowManifest

	err = proto.Unmarshal(bytes, &manifest)
	if err != nil {
		return nil, err
	}

	return &manifest, nil
}

func (we *WorkflowEngine) GetWorkflowExecutionState(id string) (*models.WorkflowExecutionState, error) {
	bytes, err := we.execStore.Get(id)
	if err != nil {
		return nil, err
	}

	var executionState models.WorkflowExecutionState

	err = proto.Unmarshal(bytes, &executionState)
	if err != nil {
		return nil, err
	}

	return &executionState, nil
}

func New(emitter emitter.Emitter, manifestStore kv.KeyValue, execStore kv.KeyValue, lock lock.Lock) *WorkflowEngine {
	we := &WorkflowEngine{manifestStore: manifestStore, execLock: lock, execStore: execStore, emitter: emitter}

	err := RegisterTaskConsumers(we)
	if err != nil {
		panic(err)
	}

	err = RegisterWorkflowConsumers(we)
	if err != nil {
		panic(err)
	}
	return we
}

func (we *WorkflowEngine) ExecuteWorkflow(id string) error {

	if id == "" {
		panic("id is required")
	}

	bytes, err := we.manifestStore.Get(id)
	if err != nil {
		return err
	}

	var manifest models.WorkflowManifest

	err = proto.Unmarshal(bytes, &manifest)
	if err != nil {
		return err
	}

	uuid := uuid.New()

	event := &models.WorkflowEvent{
		Type:        models.WorkflowEventType_WORKFLOW_EVENT_TYPE_PENDING,
		ExecutionId: uuid.String(),
		ManifestId:  id,
		WorkflowId:  manifest.WorkflowId,
		ProjectId:   manifest.ProjectId,
		Event: &models.WorkflowEvent_Pending{
			Pending: &models.WorkflowPendingEvent{},
		},
	}

	payload, err := proto.Marshal(event)

	if err != nil {
		return err
	}
	err = we.emitter.Emit(fmt.Sprintf("project.%s.workflow.%s", manifest.ProjectId, manifest.WorkflowId), payload)
	return err
}
