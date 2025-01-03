package engine_test

import (
	"context"
	"testing"
	"time"

	"github.com/flothq/flot/internal/emitter"
	"github.com/flothq/flot/internal/engine"
	"github.com/flothq/flot/internal/kv"
	"github.com/flothq/flot/internal/lock"
	"github.com/flothq/flot/models"
	"github.com/google/uuid"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/structpb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func TestEngine(t *testing.T) {

	opts := &server.Options{
		JetStream: true,
		StoreDir:  "./nats",
	}

	// Initialize new server with options
	ns, err := server.NewServer(opts)

	if err != nil {
		panic(err)
	}

	// Start the server via goroutine
	go ns.Start()

	// Wait for server to be ready for connections
	if !ns.ReadyForConnections(4 * time.Second) {
		panic("not ready for connection")
	}

	// Connect to server
	nc, err := nats.Connect(ns.ClientURL())

	if err != nil {
		panic(err)
	}

	js, err := jetstream.New(nc)
	if err != nil {
		panic(err)
	}

	manifest := models.WorkflowManifest{
		Id:         "123",
		ProjectId:  "123",
		WorkflowId: "123",
		CreatedAt:  timestamppb.Now(),
		StartAt:    "start",
		States: map[string]*models.TaskDefinition{
			"start": &models.TaskDefinition{
				DependsOn:       []string{},
				Dependants:      []string{},
				MaxRetries:      3,
				Backoff:         []int64{},
				RetryableErrors: []string{},
				SecretBindings:  []string{},
				TaskType:        models.TaskType_TASK_TYPE_INPUT,
				TaskIdentifier:  "test",
				Config: map[string]*structpb.Value{
					"hello": structpb.NewStringValue("world"),
				},
			},
		},
		WaitForResponse: false,
	}
	bytes, _ := proto.Marshal(&manifest)

	manifestKv, err := js.CreateOrUpdateKeyValue(context.Background(), jetstream.KeyValueConfig{
		Bucket: "workflow_manifests",
	})
	if err != nil {
		panic(err)
	}

	manifestStore := kv.NewNatsKv(manifestKv)
	manifestStore.Put("123", bytes)

	executionStateKv, err := js.CreateOrUpdateKeyValue(context.Background(), jetstream.KeyValueConfig{
		Bucket: "executionstate",
	})
	if err != nil {
		panic(err)
	}
	execStore := kv.NewNatsKv(executionStateKv)

	lock, err := lock.NewNatsLock("executionstate", js, lock.WithTimeout(time.Second*1))
	if err != nil {
		panic(err)
	}

	_, err = nc.QueueSubscribe("tasks.start", "tasks", func(msg *nats.Msg) {
		println("Received task")
		response := &models.TaskExecutionResult{
			Id: uuid.NewString(),
			Data: map[string]*structpb.Value{
				"hello": structpb.NewStringValue("world"),
			},
		}

		bytes, err := proto.Marshal(response)
		if err != nil {
			msg.Nak()
		}

		msg.Respond(bytes)
	})

	if err != nil {
		panic(err)
	}

	stream, err := js.CreateOrUpdateStream(context.Background(), jetstream.StreamConfig{
		Name:      "workflow-events",
		Subjects:  []string{"project.*.workflow.*", "project.*.workflow.*.task.*"},
		Retention: jetstream.WorkQueuePolicy,
	})
	if err != nil {
		panic(err)
	}

	emitter, err := emitter.NewNatsEmitter(stream, js, nc)
	if err != nil {
		panic(err)
	}

	workflowEngine := engine.New(emitter, manifestStore, execStore, lock)

	err = workflowEngine.ExecuteWorkflow("123")
	if err != nil {
		panic(err)
	}

	time.Sleep(time.Millisecond * 50)

}
